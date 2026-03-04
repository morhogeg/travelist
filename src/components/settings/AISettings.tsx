import React, { useState, useEffect } from "react";
import { Sparkles, ShieldCheck, Zap, ChevronRight } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { lightHaptic } from "@/utils/ios/haptics";
import SettingsRow from "./SettingsRow";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter,
    DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const RowDivider = () => (
    <div className="h-px bg-gradient-to-r from-transparent via-border/40 to-transparent ml-8" />
);

const AISettings = () => {
    const [showAISuggestions, setShowAISuggestions] = useState(() => {
        const saved = localStorage.getItem("showAISuggestions");
        return saved === null ? true : saved === "true";
    });

    const [aiStatus, setAiStatus] = useState<"connected" | "disconnected" | "checking">("checking");
    const [providerName, setProviderName] = useState("Travelist AI");

    useEffect(() => {
        const openrouterKey = import.meta.env.VITE_OPENROUTER_API_KEY;
        setAiStatus("connected");
        setProviderName(
            openrouterKey && openrouterKey.length > 5
                ? "DeepSeek (via OpenRouter)"
                : "Gemini 3 Flash (Google AI)"
        );
    }, []);

    const handleToggleAISuggestions = (checked: boolean) => {
        lightHaptic();
        setShowAISuggestions(checked);
        localStorage.setItem("showAISuggestions", String(checked));
        window.dispatchEvent(new CustomEvent("aiSuggestionsChanged"));
    };

    return (
        <div>
            <SettingsRow
                icon={Sparkles}
                iconColor="#667eea"
                title="AI Suggestions"
                subtitle="Personalized recommendations based on your taste."
                action={
                    <Switch
                        checked={showAISuggestions}
                        onCheckedChange={handleToggleAISuggestions}
                    />
                }
            />

            <RowDivider />

            {/* AI Model Status Row */}
            <div className="py-3 px-1 flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#667eea]/10 flex items-center justify-center shrink-0">
                    <Zap className="h-4 w-4" style={{ color: '#667eea' }} />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-[15px]">AI Model</p>
                    <p className="text-xs text-muted-foreground truncate">{providerName}</p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                    <div className={`h-1.5 w-1.5 rounded-full ${aiStatus === 'connected' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                    <span className="text-xs text-muted-foreground capitalize">{aiStatus}</span>
                </div>
            </div>

            <RowDivider />

            {/* Privacy Row */}
            <Dialog>
                <DialogTrigger asChild>
                    <div className="py-3 px-1 flex items-center gap-3 cursor-pointer active:opacity-70 ios26-transition-smooth">
                        <div className="w-8 h-8 rounded-lg bg-[#667eea]/10 flex items-center justify-center shrink-0">
                            <ShieldCheck className="h-4 w-4" style={{ color: '#667eea' }} />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                            <p className="font-medium text-[15px]">Privacy & Data</p>
                            <p className="text-xs text-muted-foreground">How we use your data</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                    </div>
                </DialogTrigger>
                <DialogContent className="max-w-[90vw] rounded-3xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                            <ShieldCheck className="h-5 w-5 text-emerald-500" />
                            Your Privacy & AI
                        </DialogTitle>
                        <DialogDescription className="text-left pt-2 space-y-3">
                            <p>
                                To provide personalized suggestions, Travelist AI sends anonymized data
                                about your saved places to our processing partners.
                            </p>
                            <div className="bg-neutral-50 dark:bg-neutral-900 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800">
                                <p className="text-xs font-bold mb-1">We share:</p>
                                <ul className="text-xs space-y-1 list-disc pl-4">
                                    <li>Place names and categories</li>
                                    <li>City and country names</li>
                                    <li>Existing tips/notes you've added</li>
                                </ul>
                            </div>
                            <div className="bg-amber-50 dark:bg-amber-900/20 p-3 rounded-xl border border-amber-100 dark:border-amber-900/30">
                                <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-1">We NEVER share:</p>
                                <ul className="text-xs space-y-1 list-disc pl-4 text-amber-700/80 dark:text-amber-400/80">
                                    <li>Your email or identity</li>
                                    <li>Your current GPS location</li>
                                    <li>Personal photos or contacts</li>
                                </ul>
                            </div>
                            <p className="text-xs italic text-muted-foreground">
                                Our AI partner (Google Gemini) processes requests securely and does not
                                use your data to train models.
                            </p>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button className="w-full rounded-xl">Got it</Button>
                        </DialogClose>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default AISettings;
