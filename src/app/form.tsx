"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";

const users = [
  "odysseustz",
  "feides",
  "milandereede",
  "omarreid",
  "biohacker",
  "mosnassar",
  "BENNN",
  "camellia",
  "electrafrost",
  "valone",
  "dexhunter",
  "nurtinba",
  "yoddha.eth",
  "smorez",
  "0htrap1",
  "gautham",
  "haider",
  "vitorangonese",
  "arvinatwild",
  "cdtr",
  "kirina",
  "zahara",
  "shasan",
  "jangle",
  "ph0t0nic",
  "donovansung",
  "fazam",
  "nicovrg",
  "hugofaz",
  "emideluxe",
  "rrominarr",
  "Ysh",
  "dhairyachheda.eth",
  "memester",
  "rudrakanya",
  "calvinlegassick",
  "heyzeus",
  "fisheatschips",
  "beecurious",
  "blackmajic5000",
  "krisx",
  "sambhav",
  "balajis",
  "carl-b",
];
export function Form({
  onSubmit,
  isLoading = false,
}: {
  onSubmit: (users: string[]) => void;
  isLoading: boolean;
}) {
  const [value, setValue] = useState(users.join(", "));
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(convertToArray(value));
      }}
    >
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={6}
      />
      <Button type="submit" className="w-full" isLoading={isLoading}>
        Generate Graph
      </Button>
    </form>
  );
}

function convertToArray(input: string): string[] {
  // First, we replace commas with spaces to unify the separators.
  // Then we split the string using spaces as the separator while filtering out empty entries.
  return input
    .replace(/,/g, " ") // Replace all commas with spaces
    .trim() // Remove leading and trailing whitespace
    .split(/\s+/); // Split by one or more spaces
}
