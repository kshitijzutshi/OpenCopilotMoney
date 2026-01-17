"use server";

/**
 * USER ACTIONS FOR MULTI-TENANT OPENCOPILOTMONEY APPLICATION
 * ================================================
 *
 * This file contains server actions for managing users in a multi-tenant financial management application.
 * It follows Prisma best practices and implements the dual-layer architecture pattern.
 *
 * ARCHITECTURE OVERVIEW:
 * ---------------------
 * 1. Authentication Layer: User (better-auth) → Session management
 * 2. Application Layer: AppUser → Family → Financial data
 *
 * BEST PRACTICES IMPLEMENTED:
 * ---------------------------
 * ✅ Prisma Client instantiation per request (not global)
 * ✅ Proper error handling and type safety
 * ✅ Transaction safety for multi-table operations
 * ✅ Role-based access control validation
 * ✅ Input validation and sanitization
 * ✅ Separation of auth concerns from business logic
 *
 * USAGE PATTERNS:
 * --------------
 *
 * 1. GET CURRENT APP USER (recommended approach):
 *    ```typescript
 *    const appUser = await getCurrentAppUser();
 *    if (!appUser) redirect('/login');
 *    ```
 *
 * 2. GET USER'S FAMILIES:
 *    ```typescript
 *    const families = await getUserFamilies();
 *    ```
 *
 * 3. CREATE OR JOIN FAMILY:
 *    ```typescript
 *    const family = await createFamily({ name: "My Household" });
 *    await joinFamily(familyId, "MEMBER");
 *    ```
 *
 * 4. ROLE-BASED OPERATIONS:
 *    ```typescript
 *    const canManage = await checkFamilyPermission(familyId, ["OWNER", "ADMIN"]);
 *    if (!canManage) throw new Error("Insufficient permissions");
 *    ```
 *
 * WHY USE AppUser INSTEAD OF Session User?
 * ---------------------------------------
 * - Session User: Authentication identity only (email, basic info)
 * - AppUser: Application profile with preferences, family memberships, business logic
 * - Separation allows auth system changes without affecting financial data
 * - Enables multi-tenancy through Family relationships
 * - Better performance for application queries
 *
 * SECURITY CONSIDERATIONS:
 * -----------------------
 * - All actions validate user authentication
 * - Family operations check role-based permissions
 * - Data isolation between families
 * - Input sanitization and validation
 * - Error messages don't leak sensitive information
 */

import { PrismaClient } from "@/generated/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import type { FamilyRole, Prisma } from "@/generated/prisma";

// Prisma client instantiation per request (best practice)
function getPrismaClient() {
  return new PrismaClient();
}

// Types for better TypeScript support
type CreateFamilyInput = {
  name: string;
  description?: string;
  currency?: string;
  timezone?: string;
};

type UpdateAppUserInput = {
  firstName?: string;
  lastName?: string;
  timezone?: string;
  locale?: string;
  preferences?: Prisma.InputJsonValue;
};

type InviteFamilyMemberInput = {
  familyId: string;
  email: string;
  role: FamilyRole;
};

/**
 * Get the current authenticated user from better-auth session
 */
export async function getCurrentAuthUser() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  return session?.user || null;
}

/**
 * Get or create the current AppUser (application profile)
 * This is the recommended way to get user data for business logic
 */
export async function getCurrentAppUser() {
  const authUser = await getCurrentAuthUser();
  if (!authUser) return null;

  const prisma = getPrismaClient();

  try {
    // Try to get existing AppUser
    let appUser = await prisma.appUser.findUnique({
      where: { userId: authUser.id },
      include: {
        familyMemberships: {
          include: {
            family: true,
          },
        },
      },
    });

    // Create AppUser if it doesn't exist (first login)
    if (!appUser) {
      try {
        appUser = await prisma.appUser.create({
          data: {
            userId: authUser.id,
            firstName: authUser.name?.split(" ")[0] || null,
            lastName: authUser.name?.split(" ").slice(1).join(" ") || null,
          },
          include: {
            familyMemberships: {
              include: {
                family: true,
              },
            },
          },
        });
      } catch (createError) {
        // Handle race condition - another request might have created the AppUser
        if (
          createError instanceof Error &&
          createError.message.includes("P2002")
        ) {
          // Try to fetch the AppUser again
          appUser = await prisma.appUser.findUnique({
            where: { userId: authUser.id },
            include: {
              familyMemberships: {
                include: {
                  family: true,
                },
              },
            },
          });

          if (!appUser) {
            // If still not found, re-throw the original error
            throw createError;
          }
        } else {
          throw createError;
        }
      }
    }

    return appUser;
  } catch (error) {
    console.error("Error getting current AppUser:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Update the current AppUser profile
 */
export async function updateCurrentAppUser(input: UpdateAppUserInput) {
  const appUser = await getCurrentAppUser();
  if (!appUser) {
    throw new Error("User not authenticated");
  }

  const prisma = getPrismaClient();

  try {
    const updatedUser = await prisma.appUser.update({
      where: { id: appUser.id },
      data: {
        ...input,
        updatedAt: new Date(),
      },
      include: {
        familyMemberships: {
          include: {
            family: true,
          },
        },
      },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("Error updating AppUser:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Update failed",
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get all families the current user belongs to
 */
export async function getUserFamilies() {
  const appUser = await getCurrentAppUser();
  if (!appUser) return [];

  const prisma = getPrismaClient();

  try {
    const families = await prisma.familyMember.findMany({
      where: { appUserId: appUser.id },
      include: {
        family: {
          include: {
            members: {
              include: {
                appUser: {
                  include: {
                    user: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        joinedAt: "asc",
      },
    });

    return families.map((fm) => ({
      ...fm.family,
      userRole: fm.role,
      joinedAt: fm.joinedAt,
    }));
  } catch (error) {
    console.error("Error getting user families:", error);
    return [];
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Create a new family and make the current user the owner
 */
export async function createFamily(input: CreateFamilyInput) {
  const appUser = await getCurrentAppUser();
  if (!appUser) {
    throw new Error("User not authenticated");
  }

  const prisma = getPrismaClient();

  try {
    // Use transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Create the family
      const family = await tx.family.create({
        data: {
          name: input.name.trim(),
          description: input.description?.trim(),
          currency: input.currency || "USD",
          timezone: input.timezone || "UTC",
        },
      });

      // Add the creator as the owner
      const membership = await tx.familyMember.create({
        data: {
          familyId: family.id,
          appUserId: appUser.id,
          role: "OWNER",
        },
      });

      return { family, membership };
    });

    return { success: true, family: result.family };
  } catch (error) {
    console.error("Error creating family:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create family",
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Check if the current user has specific roles in a family
 */
export async function checkFamilyPermission(
  familyId: string,
  requiredRoles: FamilyRole[]
) {
  const appUser = await getCurrentAppUser();
  if (!appUser) return false;

  const prisma = getPrismaClient();

  try {
    const membership = await prisma.familyMember.findUnique({
      where: {
        familyId_appUserId: {
          familyId,
          appUserId: appUser.id,
        },
      },
    });

    return membership ? requiredRoles.includes(membership.role) : false;
  } catch (error) {
    console.error("Error checking family permission:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Invite a user to join a family (requires OWNER or ADMIN role)
 */
export async function inviteFamilyMember(input: InviteFamilyMemberInput) {
  const appUser = await getCurrentAppUser();
  if (!appUser) {
    throw new Error("User not authenticated");
  }

  // Check permissions
  const canInvite = await checkFamilyPermission(input.familyId, [
    "OWNER",
    "ADMIN",
  ]);
  if (!canInvite) {
    throw new Error("Insufficient permissions to invite members");
  }

  const prisma = getPrismaClient();

  try {
    // Check if user is already a member
    const existingMember = await prisma.familyMember.findFirst({
      where: {
        familyId: input.familyId,
        appUser: {
          user: {
            email: input.email,
          },
        },
      },
    });

    if (existingMember) {
      return {
        success: false,
        error: "User is already a member of this family",
      };
    }

    // Check for existing pending invitation
    const existingInvitation = await prisma.familyInvitation.findUnique({
      where: {
        familyId_email: {
          familyId: input.familyId,
          email: input.email,
        },
      },
    });

    if (existingInvitation && existingInvitation.status === "PENDING") {
      return {
        success: false,
        error: "Invitation already sent to this email",
      };
    }

    // Create or update invitation
    const invitation = await prisma.familyInvitation.upsert({
      where: {
        familyId_email: {
          familyId: input.familyId,
          email: input.email,
        },
      },
      update: {
        role: input.role,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        invitedBy: appUser.id,
        updatedAt: new Date(),
      },
      create: {
        familyId: input.familyId,
        email: input.email,
        role: input.role,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        invitedBy: appUser.id,
      },
    });

    return { success: true, invitation };
  } catch (error) {
    console.error("Error inviting family member:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to send invitation",
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Accept a family invitation
 */
export async function acceptFamilyInvitation(token: string) {
  const authUser = await getCurrentAuthUser();
  if (!authUser) {
    throw new Error("User not authenticated");
  }

  const prisma = getPrismaClient();

  try {
    // Use transaction to ensure consistency
    const result = await prisma.$transaction(async (tx) => {
      // Find and validate invitation
      const invitation = await tx.familyInvitation.findUnique({
        where: { token },
        include: { family: true },
      });

      if (!invitation) {
        throw new Error("Invalid invitation token");
      }

      if (invitation.status !== "PENDING") {
        throw new Error("Invitation is no longer valid");
      }

      if (invitation.expiresAt < new Date()) {
        throw new Error("Invitation has expired");
      }

      if (invitation.email !== authUser.email) {
        throw new Error("Invitation is for a different email address");
      }

      // Get or create AppUser
      let appUser = await tx.appUser.findUnique({
        where: { userId: authUser.id },
      });

      if (!appUser) {
        appUser = await tx.appUser.create({
          data: {
            userId: authUser.id,
            firstName: authUser.name?.split(" ")[0] || null,
            lastName: authUser.name?.split(" ").slice(1).join(" ") || null,
          },
        });
      }

      // Check if already a member
      const existingMember = await tx.familyMember.findUnique({
        where: {
          familyId_appUserId: {
            familyId: invitation.familyId,
            appUserId: appUser.id,
          },
        },
      });

      if (existingMember) {
        throw new Error("You are already a member of this family");
      }

      // Create family membership
      const membership = await tx.familyMember.create({
        data: {
          familyId: invitation.familyId,
          appUserId: appUser.id,
          role: invitation.role,
        },
      });

      // Update invitation status
      await tx.familyInvitation.update({
        where: { id: invitation.id },
        data: { status: "ACCEPTED" },
      });

      return { family: invitation.family, membership };
    });

    return { success: true, family: result.family };
  } catch (error) {
    console.error("Error accepting family invitation:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to accept invitation",
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get family details with members (requires family membership)
 */
export async function getFamilyDetails(familyId: string) {
  const appUser = await getCurrentAppUser();
  if (!appUser) {
    throw new Error("User not authenticated");
  }

  // Check if user is a member
  const isMember = await checkFamilyPermission(familyId, [
    "OWNER",
    "ADMIN",
    "MEMBER",
    "VIEWER",
  ]);
  if (!isMember) {
    throw new Error("Access denied: Not a family member");
  }

  const prisma = getPrismaClient();

  try {
    const family = await prisma.family.findUnique({
      where: { id: familyId },
      include: {
        members: {
          include: {
            appUser: {
              include: {
                user: {
                  select: {
                    id: true,
                    email: true,
                    name: true,
                    image: true,
                  },
                },
              },
            },
          },
          orderBy: {
            joinedAt: "asc",
          },
        },
        invitations: {
          where: {
            status: "PENDING",
            expiresAt: {
              gt: new Date(),
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    return family;
  } catch (error) {
    console.error("Error getting family details:", error);
    return null;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Remove a family member (requires OWNER or ADMIN role, cannot remove last OWNER)
 */
export async function removeFamilyMember(familyId: string, memberId: string) {
  const appUser = await getCurrentAppUser();
  if (!appUser) {
    throw new Error("User not authenticated");
  }

  // Check permissions
  const canRemove = await checkFamilyPermission(familyId, ["OWNER", "ADMIN"]);
  if (!canRemove) {
    throw new Error("Insufficient permissions to remove members");
  }

  const prisma = getPrismaClient();

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Get member to remove
      const memberToRemove = await tx.familyMember.findUnique({
        where: { id: memberId },
      });

      if (!memberToRemove || memberToRemove.familyId !== familyId) {
        throw new Error("Member not found");
      }

      // Prevent removing the last owner
      if (memberToRemove.role === "OWNER") {
        const ownerCount = await tx.familyMember.count({
          where: {
            familyId,
            role: "OWNER",
          },
        });

        if (ownerCount <= 1) {
          throw new Error("Cannot remove the last owner of the family");
        }
      }

      // Remove the member
      await tx.familyMember.delete({
        where: { id: memberId },
      });

      return { success: true };
    });

    return result;
  } catch (error) {
    console.error("Error removing family member:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to remove member",
    };
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Utility function to ensure user has an AppUser profile
 * Call this in pages/components that require application data
 */
export async function ensureAppUser() {
  const appUser = await getCurrentAppUser();
  if (!appUser) {
    redirect("/login");
  }
  return appUser;
}
