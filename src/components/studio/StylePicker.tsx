"use client";
import * as React from "react";
import type { StyleKey } from "@/lib/studio/stylePrompts";

const STYLES: StyleKey[] = [
  "minimalist",
  "vintage",
  "modern",
  "grunge",
  "elegant",
  "playful",
  "streetwear",
  "sporty",
  "bohemian",
  "art-deco",
  "futuristic",
];

export function StylePicker(props: {
  value: StyleKey;
  onChange: (s: StyleKey) => void;
}) {
  return (
    <label className="block text-sm">
      <span className="mb-1 block font-medium">Style</span>
      <select
        className="border border-border rounded-md px-2 py-1 w-full bg-background"
        value={props.value}
        onChange={(e) => props.onChange(e.target.value as StyleKey)}
      >
        {STYLES.map((s) => (
          <option key={s} value={s}>
            {s.replace('-', ' ')}
          </option>
        ))}
      </select>
    </label>
  );
}