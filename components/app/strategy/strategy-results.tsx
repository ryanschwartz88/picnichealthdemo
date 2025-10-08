"use client";

import { useEffect, useMemo, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import type { Strategy } from "@/types/strategy";

interface StrategyResultsProps {
  strategy: Strategy;
}

interface StrategySectionItem {
  key: "priorities" | "keyAssets" | "opportunities" | "contacts";
  content: string;
}

export function StrategyResults({ strategy }: StrategyResultsProps) {
  const sections = useMemo<StrategySectionItem[]>(() => {
    const items: StrategySectionItem[] = [];

    if (strategy.priorities) {
      items.push({ key: "priorities", content: strategy.priorities });
    }
    if (strategy.keyAssets) {
      items.push({ key: "keyAssets", content: strategy.keyAssets });
    }
    if (strategy.opportunities) {
      items.push({ key: "opportunities", content: strategy.opportunities });
    }
    if (strategy.contacts) {
      items.push({ key: "contacts", content: strategy.contacts });
    }

    return items;
  }, [strategy.contacts, strategy.keyAssets, strategy.opportunities, strategy.priorities]);

  const [expandedSections, setExpandedSections] = useState<string[]>(() =>
    sections.length > 0 ? [sections[0].key] : []
  );

  useEffect(() => {
    if (sections.length === 0) {
      setExpandedSections([]);
      return;
    }

    setExpandedSections((prev) => {
      if (prev.length === 0) {
        return [sections[0].key];
      }

      // Ensure currently expanded keys still exist
      const validKeys = prev.filter((key) => sections.some((section) => section.key === key));
      return validKeys.length > 0 ? validKeys : [sections[0].key];
    });
  }, [sections]);

  const sectionTitles: Record<StrategySectionItem["key"], string> = {
    priorities: "Priorities",
    keyAssets: "Key Assets & Programs",
    opportunities: "Opportunities",
    contacts: "Key Contacts",
  };

  const toggleSection = (key: StrategySectionItem["key"]) => {
    setExpandedSections((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    );
  };

  const expandAll = () => {
    setExpandedSections(sections.map((s) => s.key));
  };

  const collapseAll = () => {
    setExpandedSections([]);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto">
      <div className="sticky top-0 z-10 border-b bg-background px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">{strategy.title}</h1>
            <div className="mt-1 flex items-center gap-2">
              <Badge variant={strategy.status === "complete" ? "default" : "secondary"}>
                {strategy.status}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {new Date(strategy.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll}>
              <ChevronDownIcon className="mr-2 h-4 w-4" />
              Expand All
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              <ChevronUpIcon className="mr-2 h-4 w-4" />
              Collapse All
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="mx-auto max-w-5xl space-y-4">
          {sections.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center text-muted-foreground">
                No strategy results available yet.
              </CardContent>
            </Card>
          ) : (
            sections.map((section) => (
              <Card key={section.key} className="overflow-hidden">
                <CardHeader
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => toggleSection(section.key)}
                >
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {sectionTitles[section.key]}
                    </CardTitle>
                    <ChevronDownIcon
                      className={`h-5 w-5 transition-transform ${
                        expandedSections.includes(section.key) ? "rotate-180" : ""
                      }`}
                    />
                  </div>
                </CardHeader>

                {expandedSections.includes(section.key) && (
                  <CardContent className="pt-0">
                    <div className="prose prose-sm max-w-none dark:prose-invert">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {section.content}
                      </ReactMarkdown>
                    </div>

                  </CardContent>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

