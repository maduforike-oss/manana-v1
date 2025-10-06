import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { THREAD_LIBRARY, ThreadColor, getDesignThreadColors } from "@/lib/embroidery";
import { extractNodeColors } from "@/lib/print-ready/printMethods";
import { Node } from "@/lib/studio/types";
import { Palette, Search } from "lucide-react";

interface ThreadColorPickerProps {
  nodes: Node[];
  onColorSelect?: (thread: ThreadColor) => void;
}

export function ThreadColorPicker({ nodes, onColorSelect }: ThreadColorPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBrand, setSelectedBrand] = useState<string>("All");

  // Get colors used in design
  const designColors = nodes.flatMap((node) => extractNodeColors(node));
  const designThreads = getDesignThreadColors(designColors);

  // Filter threads
  const filteredThreads = THREAD_LIBRARY.filter((thread) => {
    const matchesSearch =
      thread.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      thread.code.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesBrand = selectedBrand === "All" || thread.brand === selectedBrand;
    return matchesSearch && matchesBrand;
  });

  const brands = ["All", ...Array.from(new Set(THREAD_LIBRARY.map((t) => t.brand)))];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Palette className="h-5 w-5" />
          Thread Colors
        </CardTitle>
        <CardDescription>
          Select from commercial embroidery thread libraries
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Design Colors */}
        {designThreads.length > 0 && (
          <>
            <div>
              <h4 className="text-sm font-medium mb-2">Used in Design</h4>
              <div className="flex flex-wrap gap-2">
                {designThreads.map((thread) => (
                  <ThreadColorSwatch
                    key={thread.id}
                    thread={thread}
                    onClick={onColorSelect}
                    showLabel
                  />
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                {designThreads.length} / 15 thread colors
              </p>
            </div>
            <Separator />
          </>
        )}

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search thread colors..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Brand Filter */}
        <div className="flex flex-wrap gap-2">
          {brands.map((brand) => (
            <Badge
              key={brand}
              variant={selectedBrand === brand ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedBrand(brand)}
            >
              {brand}
            </Badge>
          ))}
        </div>

        {/* Thread Library */}
        <ScrollArea className="h-[300px]">
          <div className="grid grid-cols-2 gap-2 pr-4">
            {filteredThreads.map((thread) => (
              <ThreadColorSwatch
                key={thread.id}
                thread={thread}
                onClick={onColorSelect}
                showLabel
                showCode
              />
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

interface ThreadColorSwatchProps {
  thread: ThreadColor;
  onClick?: (thread: ThreadColor) => void;
  showLabel?: boolean;
  showCode?: boolean;
}

function ThreadColorSwatch({ thread, onClick, showLabel, showCode }: ThreadColorSwatchProps) {
  return (
    <div
      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted cursor-pointer transition-colors border border-transparent hover:border-border"
      onClick={() => onClick?.(thread)}
    >
      <div
        className="w-8 h-8 rounded-md border-2 border-border shrink-0"
        style={{ backgroundColor: thread.hex }}
      />
      {(showLabel || showCode) && (
        <div className="flex-1 min-w-0">
          {showLabel && (
            <p className="text-xs font-medium truncate">{thread.name}</p>
          )}
          {showCode && (
            <p className="text-xs text-muted-foreground">{thread.code}</p>
          )}
        </div>
      )}
    </div>
  );
}
