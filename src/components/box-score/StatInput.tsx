
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface StatInputProps {
    label: string;
    value: string | number;
    onChange: (val: string) => void;
    type?: string;
    isAdmin: boolean;
}

export const StatInput = ({ label, value, onChange, type = "number", isAdmin }: StatInputProps) => (
    <div className="flex flex-col gap-0.5">
        <Label className="text-[10px] font-black uppercase text-muted-foreground tracking-tighter font-mono text-center">{label}</Label>
        {isAdmin ? (
            <Input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="h-7 text-sm font-mono font-bold tabular-nums text-center"
            />
        ) : (
            <div className="flex items-center justify-center h-7 text-sm font-mono font-bold tabular-nums bg-muted/20 border border-primary/5 rounded-md">
                {value || "0"}
            </div>
        )}
    </div>
);
