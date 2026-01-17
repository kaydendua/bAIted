import { Button } from "@/components/ui/button"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSeparator,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"

import { RefreshCwIcon } from "lucide-react"

export default function Home() {
  return (
    <>
      <header className="flex flex-col items-center">
        <h1 className="text-3xl font-bold tracking-tight md:text-5xl">bAIted</h1>
        <p className="text-lg text-balance opacity-80 sm:text-xl">
          A spin-off on Among Us. A fun game where players code answers to questions and attempt determine who is the Vibe coder.
        </p>
      </header>

      <main className="box-border w-96 p-4 border flex flex-col items-center 100 mx-auto">
        <FieldSet>
          <Field>
            <FieldLabel htmlFor="name">Name</FieldLabel>
            <FieldContent className="flex flex-row">
              <Input id="name" placeholder="Enter name" />
              <Button size="icon"><RefreshCwIcon /></Button>
            </FieldContent>
          </Field>
          <Field>
            <FieldLabel htmlFor="lobby-code">Lobby Code</FieldLabel>
            <FieldContent>
              <Input id="lobby-code" placeholder="Enter lobby code" />
            </FieldContent>
          </Field>
        </FieldSet>

        <Button variant="outline" className="posi text-l text-center">Join Lobby</Button>
        <Button variant="outline" className="posi text-l text-center">Create Lobby</Button>
      </main>
    </>

  );
}
