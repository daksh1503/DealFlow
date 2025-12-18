"use client";

import { Kanban, DollarSign, FileText, Bell, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

const features = [
  {
    icon: Kanban,
    title: "Deal Pipeline",
    description: "Track every brand deal from first contact to payment with a visual Kanban board.",
  },
  {
    icon: DollarSign,
    title: "Earnings Tracking",
    description: "Monitor your income, pending payments, and see which brands pay you the most.",
  },
  {
    icon: FileText,
    title: "Contract Vault",
    description: "Store all your contracts in one place. Never lose track of usage rights again.",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    description: "Get notified about follow-ups, content deadlines, and payment dates.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-primary flex items-center justify-center">
              <Kanban className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold">DealFlow</span>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Link href="/login">
              <Button data-testid="button-login">
                Sign In
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Your Brand Deals,{" "}
              <span className="text-primary">Organized</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              The simple CRM built for creators. Track deals, manage payments,
              and never miss a deadline again.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/login">
                <Button size="lg" data-testid="button-get-started">
                  Get Started Free
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
              <p className="text-sm text-muted-foreground">
                No credit card required
              </p>
            </div>
          </div>
        </section>

        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
              Everything you need to manage your creator business
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {features.map((feature) => (
                <Card key={feature.title} className="bg-card">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <feature.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">
              Built for creators, by creators
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Whether you have 10K or 500K followers, DealFlow helps you stay
              organized and get paid on time.
            </p>
            <Link href="/login">
              <Button size="lg" data-testid="button-start-free">
                Start For Free
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>Built with care for the creator economy</p>
        </div>
      </footer>
    </div>
  );
}

