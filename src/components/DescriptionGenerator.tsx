'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { generateItemDescriptionAction } from '@/lib/actions';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Wand2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

const initialState = {
  description: '',
  error: null,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? 'Generating...' : 
        <div className='flex items-center gap-2'>
          <Wand2 className="h-4 w-4" />
          <span>Generate Description</span>
        </div>
      }
    </Button>
  );
}

export function DescriptionGenerator() {
  const [state, formAction] = useFormState(generateItemDescriptionAction, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state.error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: state.error,
      });
    }
  }, [state.error, toast]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>AI Item Description Generator</CardTitle>
        <CardDescription>
          Create flavor text for a new in-game item. Powered by GenAI.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={formAction} className="grid md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="itemName">Item Name</Label>
              <Input id="itemName" name="itemName" placeholder="e.g., Blade of the Void" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemType">Item Type</Label>
              <Input id="itemType" name="itemType" placeholder="e.g., Weapon, Armor" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemRarity">Item Rarity</Label>
               <Select name="itemRarity" defaultValue="Common" required>
                <SelectTrigger id="itemRarity">
                  <SelectValue placeholder="Select rarity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Common">Common</SelectItem>
                  <SelectItem value="Uncommon">Uncommon</SelectItem>
                  <SelectItem value="Rare">Rare</SelectItem>
                  <SelectItem value="Epic">Epic</SelectItem>
                  <SelectItem value="Legendary">Legendary</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="itemTheme">Game Theme</Label>
              <Input id="itemTheme" name="itemTheme" defaultValue="Cyberpunk" placeholder="e.g., Fantasy, Sci-Fi" required />
            </div>
            <SubmitButton />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Generated Description</Label>
            <Textarea
              id="description"
              name="description"
              readOnly
              placeholder="AI-generated description will appear here..."
              value={state.description}
              className="min-h-[220px] bg-background"
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
