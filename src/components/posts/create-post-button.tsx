"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { CreatePostForm } from "./create-post-form";

export function CreatePostButton() {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新規投稿
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>新しい投稿を作成</DialogTitle>
          <DialogDescription>
            Threadsに投稿する内容を入力してください
          </DialogDescription>
        </DialogHeader>
        <CreatePostForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}