import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"

export default function VoteSection() {
  return (
    <>
      <Select>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Suspected vibecoder" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="john">John</SelectItem>
          <SelectItem value="alice">Alice</SelectItem>
          <SelectItem value="peter">Peter</SelectItem>
        </SelectContent>
      </Select>
      <Button className="w-2xl">Vote</Button>
      <div id="message">
        You voted <span id="imposter-selected" className="font-semibold">Alice</span>
      </div>
    </>
  )
}