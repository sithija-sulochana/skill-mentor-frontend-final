import { cn } from "@/lib/utils";

interface StatusPillProps {
  status: "PENDING" | "APPROVED" | "REJECTED" | null | undefined;
}

export function StatusPill({ status }: StatusPillProps) {
  if (!status) {
    return (
      <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600">
        No Payment
      </span>
    );
  }

  const displayText = status === "PENDING" ? "Pending" : status === "APPROVED" ? "Approved" : "Rejected";
  
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
        status === "PENDING" && "bg-yellow-100 text-yellow-800",
        status === "APPROVED" && "bg-green-100 text-green-800",
        status === "REJECTED" && "bg-red-100 text-red-800"
      )}
    >
      {displayText}
    </span>
  );
}
