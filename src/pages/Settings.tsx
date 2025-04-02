
import React from "react";
import Layout from "@/components/layout/Layout";
import PageHeader from "@/components/ui/PageHeader";
import { Settings as SettingsIcon } from "lucide-react";

const Settings = () => {
  return (
    <Layout>
      <PageHeader 
        title="Settings" 
        subtitle="Customize your app preferences"
        icon={<SettingsIcon className="h-8 w-8" />}
      />
      <div className="px-6 py-8 flex flex-col items-center justify-center">
        <div className="glass-card dark:glass-card-dark p-8 text-center max-w-md">
          <h3 className="text-xl font-semibold mb-2">Coming Soon</h3>
          <p className="text-muted-foreground">
            Settings options are currently under development. Check back soon!
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default Settings;
