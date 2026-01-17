import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GitHubStatsSection } from "@/components/github-stats";

export default function OpenStartupPage() {
  return (
    <main className="flex flex-col items-center justify-start min-h-[80vh] w-full py-20 px-5 space-y-12">
      <div className="max-w-2xl text-center space-y-4">
        <h1 className="text-3xl md:text-4xl font-medium tracking-tight">
          Open Startup
        </h1>
        <p className="text-muted-foreground">
          All our metrics, finances, and learnings are public. We believe in
          transparency and want to share our journey with you.
        </p>
        {/* <p className="text-muted-foreground">
          You can read more about why here:{" "}
          <a href="/waitlist" className="underline">
            Announcing Open Metrics
          </a>
          .
        </p> */}
      </div>

      <GitHubStatsSection />

      <section className="w-full max-w-4xl space-y-4">
        <h2 className="text-xl font-semibold text-center">Team OpenCopilotMoney</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-center">Role</TableHead>
              <TableHead className="text-center">Start Date</TableHead>
              <TableHead className="text-center">Location</TableHead>
              <TableHead className="text-center">Salary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Kshitij Zutshi</TableCell>
              <TableCell className="text-center">Founder</TableCell>
              <TableCell className="text-center">Jun 19th, 2025</TableCell>
              <TableCell className="text-center">Norway</TableCell>
              <TableCell className="text-center">$0</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section className="w-full max-w-3xl space-y-4">
        <h2 className="text-xl font-semibold text-center">
          Global Salary Bands
        </h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Role</TableHead>
              <TableHead className="text-center">Level</TableHead>
              <TableHead className="text-center">Salary</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>Software Engineer - Intern</TableCell>
              <TableCell className="text-center">Intern</TableCell>
              <TableCell className="text-center">$30,000</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Software Engineer - I</TableCell>
              <TableCell className="text-center">Junior</TableCell>
              <TableCell className="text-center">$60,000</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Software Engineer - II</TableCell>
              <TableCell className="text-center">Mid</TableCell>
              <TableCell className="text-center">$80,000</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Software Engineer - III</TableCell>
              <TableCell className="text-center">Senior</TableCell>
              <TableCell className="text-center">$100,000</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Software Engineer - IV</TableCell>
              <TableCell className="text-center">Principal</TableCell>
              <TableCell className="text-center">$120,000</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Designer - III</TableCell>
              <TableCell className="text-center">Senior</TableCell>
              <TableCell className="text-center">$100,000</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Designer - IV</TableCell>
              <TableCell className="text-center">Principal</TableCell>
              <TableCell className="text-center">$120,000</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Marketer - I</TableCell>
              <TableCell className="text-center">Junior</TableCell>
              <TableCell className="text-center">$50,000</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Marketer - II</TableCell>
              <TableCell className="text-center">Mid</TableCell>
              <TableCell className="text-center">$65,000</TableCell>
            </TableRow>
            <TableRow>
              <TableCell>Marketer - III</TableCell>
              <TableCell className="text-center">Senior</TableCell>
              <TableCell className="text-center">$80,000</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </section>

      <section className="w-full max-w-3xl space-y-2 text-center">
        <h2 className="text-xl font-semibold">Finances</h2>
        <p className="text-muted-foreground">
          We have not raised any funding yet. Should we? Let us know what you
          think!
        </p>
        <div className="border rounded-lg p-6">
          <p className="text-2xl font-semibold">$0</p>
          <p className="text-muted-foreground text-sm">Total Funding Raised</p>
        </div>
      </section>

      <section className="w-full max-w-3xl space-y-4">
        <h2 className="text-xl font-semibold text-center">Cap Table</h2>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div className="border rounded-lg p-4">
            <p className="text-2xl font-semibold">90%</p>
            <p className="text-muted-foreground text-sm">Founder</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-2xl font-semibold">0%</p>
            <p className="text-muted-foreground text-sm">Investors</p>
          </div>
          <div className="border rounded-lg p-4">
            <p className="text-2xl font-semibold">10%</p>
            <p className="text-muted-foreground text-sm">Team Pool</p>
          </div>
        </div>
      </section>
    </main>
  );
}
