"use client";

import { useState } from "react";
import { Input } from "./../components/ui/input";
import { Button } from "./../components/ui/button";
import { Card, CardContent } from "./../components/ui/card";
import { motion } from "framer-motion";

// Replace with your actual API endpoints
const TEXT_GEN_API = "http://localhost:5000/generate-text";
const IMAGE_GEN_API = "http://localhost:5000/generate-image";
const API_KEY = "your-api-key";

export default function AIVisualNovel() {
  const [story, setStory] = useState(
    "You wake up in a mysterious forest. What do you do?"
  );
  const [input, setInput] = useState("");
  const [background, setBackground] = useState("/default-bg.jpg");
  const [character, setCharacter] = useState("/default-character.png");
  const [isLoading, setIsLoading] = useState(false);

  const generateContent = async () => {
    if (!input || isLoading) return;

    setIsLoading(true);

    try {
      // Generate text narrative
      const textResponse = await fetch(TEXT_GEN_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          prompt: input,
          previous_story: story,
          max_length: 150,
        }),
      });

      const textData = await textResponse.json();
      const newStory = textData.story || "The story continues...";
      setStory(newStory);

      // Generate background image
      const bgResponse = await fetch(IMAGE_GEN_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          prompt: `Background image for: ${newStory}`,
          type: "background",
          resolution: "1920x1080",
        }),
      });
      const bgData = await bgResponse.json();
      setBackground(bgData.image_url || "/default-bg.jpg");

      // Generate character image
      const charResponse = await fetch(IMAGE_GEN_API, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
          prompt: `Character in: ${newStory}`,
          type: "character",
          resolution: "512x512",
        }),
      });

      const charData = await charResponse.json();
      setCharacter(charData.image_url || "/default-character.png");
    } catch (error) {
      console.error("Error generating content:", error);
    } finally {
      setIsLoading(false);
      setInput("");
    }
  };

  return (
    <div className="relative w-full h-screen flex flex-col items-center justify-center bg-gray-900 text-white">
      {/* Animated Background */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <img
          src={background}
          alt="Background"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Animated Character */}
      <motion.img
        src={character}
        alt="Character"
        className="absolute bottom-10 z-10 h-64"
        initial={{ x: 100 }}
        animate={{ x: 0 }}
        transition={{ type: "spring" }}
      />

      {/* Story Text Container */}
      <Card className="absolute bottom-32 bg-black bg-opacity-80 p-6 w-3/4 z-20 rounded-lg">
        <CardContent className="text-lg text-white max-h-100 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800">
          {story}
          {isLoading && <div className="mt-2 text-gray-400">Generating...</div>}
        </CardContent>
      </Card>

      {/* Input Section */}
      <div className="absolute bottom-10 w-3/4 flex gap-4 z-20">
        <Input
          value={input}
          onChange={(e: any) => setInput(e.target.value)}
          placeholder="Type your action..."
          className="flex-1 text-lg py-6"
          disabled={isLoading}
        />
        <Button
          onClick={generateContent}
          className="py-6 px-8 text-lg"
          disabled={isLoading}
        >
          {isLoading ? "..." : "Go"}
        </Button>
      </div>
    </div>
  );
}
