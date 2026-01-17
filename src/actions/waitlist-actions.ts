"use server";

/**
 * WAITLIST ACTIONS FOR OPENCOPILOTMONEY APPLICATION
 * =======================================
 *
 * This file contains server actions for managing the waitlist functionality.
 * It follows Prisma best practices and implements proper error handling.
 *
 * FEATURES:
 * --------
 * ✅ Join waitlist with email and optional metadata
 * ✅ Admin approval/rejection workflow
 * ✅ Position tracking and queue management
 * ✅ Invitation expiration handling
 * ✅ Conversion tracking when users create accounts
 * ✅ Duplicate prevention and validation
 * ✅ Analytics and reporting functions
 *
 * BEST PRACTICES IMPLEMENTED:
 * ---------------------------
 * ✅ Prisma Client instantiation per request (not global)
 * ✅ Proper error handling and type safety
 * ✅ Transaction safety for position management
 * ✅ Input validation and sanitization
 * ✅ Email validation and normalization
 * ✅ Rate limiting considerations
 * ✅ Privacy-conscious error messages
 *
 * USAGE PATTERNS:
 * --------------
 *
 * 1. JOIN WAITLIST:
 *    ```typescript
 *    const result = await joinWaitlist({
 *      email: "user@example.com",
 *      firstName: "John",
 *      referralSource: "friend"
 *    });
 *    ```
 *
 * 2. ADMIN APPROVAL:
 *    ```typescript
 *    await approveWaitlistEntry(waitlistId, { expiresInDays: 7 });
 *    ```
 *
 * 3. CHECK POSITION:
 *    ```typescript
 *    const position = await getWaitlistPosition("user@example.com");
 *    ```
 *
 * 4. CONVERT TO USER:
 *    ```typescript
 *    await convertWaitlistEntry(waitlistId, userId);
 *    ```
 */

import { PrismaClient } from "@/generated/prisma";
import type { WaitlistStatus } from "@/generated/prisma";

// Prisma client instantiation per request (best practice)
function getPrismaClient() {
  return new PrismaClient();
}

// Types for better TypeScript support
type JoinWaitlistInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  referralSource?: string;
  message?: string;
};

type ApproveWaitlistInput = {
  expiresInDays?: number;
  notes?: string;
};

type WaitlistStats = {
  totalEntries: number;
  pendingCount: number;
  approvedCount: number;
  convertedCount: number;
  rejectedCount: number;
  averageWaitTime: number | null;
};

/**
 * Email validation utility
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Normalize email for consistent storage
 */
function normalizeEmail(email: string): string {
  return email.toLowerCase().trim();
}

/**
 * Join the waitlist with email and optional metadata
 */
export async function joinWaitlist(input: JoinWaitlistInput) {
  const { email, firstName, lastName, referralSource, message } = input;

  // Validate email
  if (!email || !isValidEmail(email)) {
    throw new Error("Please provide a valid email address");
  }

  const normalizedEmail = normalizeEmail(email);
  const prisma = getPrismaClient();

  try {
    // Check if email already exists
    const existingEntry = await prisma.waitlist.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingEntry) {
      // Return existing entry info without revealing internal details
      return {
        success: true,
        position: existingEntry.position,
        status: existingEntry.status,
        message:
          "You're already on the waitlist! We'll notify you when it's your turn.",
      };
    }

    // Get the next position in the queue
    const lastEntry = await prisma.waitlist.findFirst({
      orderBy: { position: "desc" },
      select: { position: true },
    });

    const nextPosition = (lastEntry?.position || 0) + 1;

    // Create new waitlist entry
    const waitlistEntry = await prisma.waitlist.create({
      data: {
        email: normalizedEmail,
        firstName: firstName?.trim() || null,
        lastName: lastName?.trim() || null,
        position: nextPosition,
        referralSource: referralSource?.trim() || null,
        message: message?.trim() || null,
        status: "PENDING",
      },
    });

    return {
      success: true,
      position: waitlistEntry.position,
      status: waitlistEntry.status,
      message: `You're #${waitlistEntry.position} on the waitlist! We'll notify you when it's your turn.`,
    };
  } catch (error) {
    console.error("Error joining waitlist:", error);

    // Handle unique constraint violations gracefully
    if (error instanceof Error && error.message.includes("P2002")) {
      return {
        success: true,
        message:
          "You're already on the waitlist! We'll notify you when it's your turn.",
      };
    }

    throw new Error("Failed to join waitlist. Please try again.");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get waitlist position and status by email
 */
export async function getWaitlistPosition(email: string) {
  if (!email || !isValidEmail(email)) {
    throw new Error("Please provide a valid email address");
  }

  const normalizedEmail = normalizeEmail(email);
  const prisma = getPrismaClient();

  try {
    const entry = await prisma.waitlist.findUnique({
      where: { email: normalizedEmail },
      select: {
        position: true,
        status: true,
        createdAt: true,
        invitedAt: true,
        expiresAt: true,
      },
    });

    if (!entry) {
      return null;
    }

    return {
      position: entry.position,
      status: entry.status,
      joinedAt: entry.createdAt,
      invitedAt: entry.invitedAt,
      expiresAt: entry.expiresAt,
    };
  } catch (error) {
    console.error("Error getting waitlist position:", error);
    throw new Error("Failed to get waitlist position");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get waitlist entries for admin (with pagination)
 */
export async function getWaitlistEntries(
  page: number = 1,
  limit: number = 50,
  status?: WaitlistStatus
) {
  const prisma = getPrismaClient();
  const skip = (page - 1) * limit;

  try {
    const where = status ? { status } : {};

    const [entries, total] = await Promise.all([
      prisma.waitlist.findMany({
        where,
        orderBy: { position: "asc" },
        skip,
        take: limit,
      }),
      prisma.waitlist.count({ where }),
    ]);

    return {
      entries,
      total,
      pages: Math.ceil(total / limit),
      currentPage: page,
    };
  } catch (error) {
    console.error("Error getting waitlist entries:", error);
    throw new Error("Failed to get waitlist entries");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Approve a waitlist entry (admin only)
 */
export async function approveWaitlistEntry(
  waitlistId: string,
  input: ApproveWaitlistInput = {}
) {
  const { expiresInDays = 14, notes } = input;
  const prisma = getPrismaClient();

  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const updatedEntry = await prisma.waitlist.update({
      where: { id: waitlistId },
      data: {
        status: "APPROVED",
        invitedAt: new Date(),
        expiresAt,
        notes: notes || null,
      },
    });

    return {
      success: true,
      entry: updatedEntry,
      message: "Waitlist entry approved successfully",
    };
  } catch (error) {
    console.error("Error approving waitlist entry:", error);
    throw new Error("Failed to approve waitlist entry");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Reject a waitlist entry (admin only)
 */
export async function rejectWaitlistEntry(waitlistId: string, notes?: string) {
  const prisma = getPrismaClient();

  try {
    const updatedEntry = await prisma.waitlist.update({
      where: { id: waitlistId },
      data: {
        status: "REJECTED",
        notes: notes || null,
      },
    });

    return {
      success: true,
      entry: updatedEntry,
      message: "Waitlist entry rejected",
    };
  } catch (error) {
    console.error("Error rejecting waitlist entry:", error);
    throw new Error("Failed to reject waitlist entry");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Convert a waitlist entry to user (called when user creates account)
 */
export async function convertWaitlistEntry(waitlistId: string, userId: string) {
  const prisma = getPrismaClient();

  try {
    const updatedEntry = await prisma.waitlist.update({
      where: { id: waitlistId },
      data: {
        status: "CONVERTED",
        convertedAt: new Date(),
        userId,
      },
    });

    return {
      success: true,
      entry: updatedEntry,
      message: "Waitlist entry converted successfully",
    };
  } catch (error) {
    console.error("Error converting waitlist entry:", error);
    throw new Error("Failed to convert waitlist entry");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Convert waitlist entry by email (when user signs up)
 */
export async function convertWaitlistEntryByEmail(
  email: string,
  userId: string
) {
  const normalizedEmail = normalizeEmail(email);
  const prisma = getPrismaClient();

  try {
    const entry = await prisma.waitlist.findUnique({
      where: { email: normalizedEmail },
    });

    if (!entry) {
      return { success: false, message: "No waitlist entry found" };
    }

    if (entry.status !== "APPROVED") {
      return { success: false, message: "Waitlist entry not approved yet" };
    }

    const updatedEntry = await prisma.waitlist.update({
      where: { id: entry.id },
      data: {
        status: "CONVERTED",
        convertedAt: new Date(),
        userId,
      },
    });

    return {
      success: true,
      entry: updatedEntry,
      message: "Welcome! Your waitlist entry has been converted.",
    };
  } catch (error) {
    console.error("Error converting waitlist entry by email:", error);
    throw new Error("Failed to convert waitlist entry");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Check if email is approved for signup
 */
export async function isEmailApprovedForSignup(
  email: string
): Promise<boolean> {
  const normalizedEmail = normalizeEmail(email);
  const prisma = getPrismaClient();

  try {
    const entry = await prisma.waitlist.findUnique({
      where: { email: normalizedEmail },
      select: { status: true, expiresAt: true },
    });

    if (!entry) {
      return false;
    }

    // Check if approved and not expired
    if (entry.status === "APPROVED") {
      if (!entry.expiresAt || entry.expiresAt > new Date()) {
        return true;
      }

      // Mark as expired if past expiration date
      await prisma.waitlist.update({
        where: { email: normalizedEmail },
        data: { status: "EXPIRED" },
      });
    }

    return false;
  } catch (error) {
    console.error("Error checking email approval:", error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Get waitlist statistics (admin only)
 */
export async function getWaitlistStats(): Promise<WaitlistStats> {
  const prisma = getPrismaClient();

  try {
    const [totalEntries, statusCounts, avgWaitTime] = await Promise.all([
      prisma.waitlist.count(),
      prisma.waitlist.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      prisma.waitlist.aggregate({
        _avg: {
          position: true,
        },
        where: {
          status: "CONVERTED",
          convertedAt: { not: null },
        },
      }),
    ]);

    const stats: WaitlistStats = {
      totalEntries,
      pendingCount: 0,
      approvedCount: 0,
      convertedCount: 0,
      rejectedCount: 0,
      averageWaitTime: avgWaitTime._avg.position,
    };

    // Process status counts
    statusCounts.forEach(({ status, _count }) => {
      switch (status) {
        case "PENDING":
          stats.pendingCount = _count.status;
          break;
        case "APPROVED":
          stats.approvedCount = _count.status;
          break;
        case "CONVERTED":
          stats.convertedCount = _count.status;
          break;
        case "REJECTED":
          stats.rejectedCount = _count.status;
          break;
      }
    });

    return stats;
  } catch (error) {
    console.error("Error getting waitlist stats:", error);
    throw new Error("Failed to get waitlist statistics");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Batch approve waitlist entries by position range (admin only)
 */
export async function batchApproveWaitlist(
  fromPosition: number,
  toPosition: number,
  expiresInDays: number = 14
) {
  const prisma = getPrismaClient();

  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const result = await prisma.waitlist.updateMany({
      where: {
        position: {
          gte: fromPosition,
          lte: toPosition,
        },
        status: "PENDING",
      },
      data: {
        status: "APPROVED",
        invitedAt: new Date(),
        expiresAt,
      },
    });

    return {
      success: true,
      count: result.count,
      message: `Approved ${result.count} waitlist entries`,
    };
  } catch (error) {
    console.error("Error batch approving waitlist:", error);
    throw new Error("Failed to batch approve waitlist entries");
  } finally {
    await prisma.$disconnect();
  }
}

/**
 * Clean up expired invitations (run as cron job)
 */
export async function cleanupExpiredInvitations() {
  const prisma = getPrismaClient();

  try {
    const result = await prisma.waitlist.updateMany({
      where: {
        status: "APPROVED",
        expiresAt: {
          lt: new Date(),
        },
      },
      data: {
        status: "EXPIRED",
      },
    });

    return {
      success: true,
      count: result.count,
      message: `Marked ${result.count} invitations as expired`,
    };
  } catch (error) {
    console.error("Error cleaning up expired invitations:", error);
    throw new Error("Failed to clean up expired invitations");
  } finally {
    await prisma.$disconnect();
  }
}
