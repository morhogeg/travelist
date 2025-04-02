
import React from "react";
import { motion } from "framer-motion";
import { User, Settings, Info, Heart, MapPin } from "lucide-react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const navigate = useNavigate();
  
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="container max-w-xl mx-auto py-8 px-4"
      >
        <div className="flex flex-col items-center mb-8">
          <Avatar className="h-24 w-24 mb-4">
            <AvatarFallback className="text-2xl bg-primary/10">A</AvatarFallback>
          </Avatar>
          
          <h1 className="text-2xl font-bold">Alisa</h1>
          <p className="text-muted-foreground">Travel enthusiast</p>
          
          <div className="flex gap-4 mt-4">
            <Button variant="outline" size="sm" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Edit Profile
            </Button>
            <Button size="sm" className="flex items-center gap-2" onClick={() => navigate('/settings')}>
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </div>
        </div>
        
        <Separator className="my-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MapPin className="h-4 w-4 text-primary" />
                Places
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">12</p>
              <p className="text-muted-foreground text-sm">Saved destinations</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4 text-primary" />
                Visited
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">5</p>
              <p className="text-muted-foreground text-sm">Completed recommendations</p>
            </CardContent>
          </Card>
        </div>
        
        <h2 className="text-xl font-semibold mb-4">Account</h2>
        <div className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={() => navigate('/settings')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Settings
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <Info className="mr-2 h-4 w-4" />
            Help & Support
          </Button>
          <Button variant="ghost" className="w-full justify-start text-muted-foreground">
            <User className="mr-2 h-4 w-4" />
            Privacy
          </Button>
        </div>
      </motion.div>
    </Layout>
  );
};

export default Profile;
