import React, { useState, useEffect } from "react";
import { Sparkles, Info, ShieldCheck, Zap } from "lucide-react";
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

const AISettings = () => {
    const [showAISuggestions, setShowAISuggestions] = useState(() => {
        const saved = localStorage.getItem("showAISuggestions");
        return saved === null ? true : saved === "true";
    });

    const [aiStatus, setAiStatus] = useState<"connected" | "disconnected" | "checking">("checking");
    const [providerName, setProviderName] = useState("Travelist AI");

    useEffect(() => {
        // Basic status check
        const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
        if (apiKey && apiKey.length > 5) {
            setAiStatus("connected");
            setProviderName("DeepSeek (via OpenRouter)");
        } else {
            setAiStatus("disconnected");
        }
    }, []);

    const handleToggleAISuggestions = (checked: boolean) => {
        lightHaptic();
        setShowAISuggestions(checked);
        localStorage.setItem("showAISuggestions", String(checked));
        window.dispatchEvent(new CustomEvent("aiSuggestionsChanged"));
    };

    return (
        <div className="space-y-4">
            {/* Main Toggle */}
            <SettingsRow
                icon={Sparkles}
                title="AI Suggestions"
                subtitle="Personalized recommendations based on your taste."
                action={
                    <Switch
                        checked={showAISuggestions}
                        onCheckedChange={handleToggleAISuggestions}
                    />
                }
            />

            {/* Transparency Section */}
            <div className="bg-neutral-50 dark:bg-neutral-900/50 rounded-2xl p-4 border border-neutral-200/50 dark:border-neutral-800/50 space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Zap className={`h-4 w-4 ${aiStatus === 'connected' ? 'text-amber-500' : 'text-neutral-400'}`} />
                        <span className="text-sm font-medium">Model Status</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className={`h-2 w-2 rounded-full ${aiStatus === 'connected' ? 'bg-emerald-500' : 'bg-red-500 animation-pulse'}`} />
                        <span className="text-xs text-muted-foreground capitalize">{aiStatus}</span>
                    </div>
                </div>

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4 text-blue-500" />
                        <span className="text-sm font-medium">Active Provider</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{providerName}</span>
                </div>

                <div className="h-px bg-neutral-200 dark:bg-neutral-800" />

                <Dialog>
                    <DialogTrigger asChild>
                        <button className="flex items-center gap-2 text-primary hover:opacity-80 transition-opacity">
                            <Info className="h-4 w-4" />
                            <span className="text-xs font-semibold">How we use your data</span>
                        </button>
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
                                    Our partners (DeepSeek/OpenRouter) are contractually prohibited from using
                                    this data to train their models.
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
        </div>
    );
};

export default AISettings;
