"use client"

import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"
import { ChevronDown } from "lucide-react"
import { cn } from "cn"

function Accordion({ ...props }: AccordionPrimitive.Root.Props) {
  return <AccordionPrimitive.Root data-slot="accordion" {...props} />
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("border-b border-stone-200", className)}
      {...props}
    />
  )
}

function AccordionTrigger({ className, children, ...props }: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Trigger
      data-slot="accordion-trigger"
      className={cn("group flex w-full items-center justify-between gap-4 py-5 text-left font-semibold text-stone-800 outline-none transition-colors hover:text-[#9f5e4d] focus-visible:ring-2 focus-visible:ring-[#C07A60]", className)}
      {...props}
    >
      {children}
      <ChevronDown className="size-5 shrink-0 text-stone-500 transition-transform duration-200 group-aria-expanded:rotate-180" aria-hidden="true" />
    </AccordionPrimitive.Trigger>
  )
}

function AccordionContent({ className, ...props }: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className={cn("overflow-hidden pb-5 text-sm leading-6 text-stone-600", className)}
      {...props}
    />
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }