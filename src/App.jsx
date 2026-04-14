import React from "react";
import { Button } from "./components/ui/button";
import toast from "react-hot-toast";

export default function App() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Button
        onClick={() => {
          toast.success("Welcome to Med Stream!");
        }}
      >
        Welcome to Med Stream
      </Button>
    </div>
  );
}