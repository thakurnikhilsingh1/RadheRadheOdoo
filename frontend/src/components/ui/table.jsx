import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const Table = forwardRef(({ className, ...props }, ref) => (
  <div className="w-full overflow-auto rounded-2xl border border-slate-100 bg-white">
    <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
));
Table.displayName = "Table";

const TableHeader = forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("bg-slate-50/80 [&_tr]:border-b [&_tr]:border-slate-100", className)} {...props} />
));
TableHeader.displayName = "TableHeader";

const TableBody = forwardRef(({ className, ...props }, ref) => (
  <tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props} />
));
TableBody.displayName = "TableBody";

const TableFooter = forwardRef(({ className, ...props }, ref) => (
  <tfoot ref={ref} className={cn("border-t border-slate-100 bg-slate-50/50 font-medium", className)} {...props} />
));
TableFooter.displayName = "TableFooter";

const TableRow = forwardRef(({ className, ...props }, ref) => (
  <tr ref={ref} className={cn("border-b border-slate-50 transition-colors hover:bg-slate-50/60", className)} {...props} />
));
TableRow.displayName = "TableRow";

const TableHead = forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn("h-9 px-4 text-left align-middle text-[10px] font-bold uppercase tracking-widest text-slate-400", className)}
    {...props}
  />
));
TableHead.displayName = "TableHead";

const TableCell = forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("px-4 py-3 align-middle text-sm text-slate-700", className)} {...props} />
));
TableCell.displayName = "TableCell";

const TableCaption = forwardRef(({ className, ...props }, ref) => (
  <caption ref={ref} className={cn("mt-4 text-xs text-slate-400", className)} {...props} />
));
TableCaption.displayName = "TableCaption";

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
