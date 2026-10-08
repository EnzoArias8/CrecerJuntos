"use client"

import { Tabs as TabsPrimitive } from "@base-ui/react/tabs"
import { cn } from "cn"

function Tabs({ className, ...props }: TabsPrimitive.Root.Props) {
  return <TabsPrimitive.Root data-slot="tabs" className={cn("flex min-h-0 flex-col", className)} {...props} />
}

function TabsList({ className, ...props }: TabsPrimitive.List.Props) {
  return <TabsPrimitive.List data-slot="tabs-list" className={cn("flex shrink-0 items-center gap-1 border-b border-stone-200", className)} {...props} />
}

function TabsTrigger({ className, ...props }: TabsPrimitive.Tab.Props) {
  return (
    <TabsPrimitive.Tab
      data-slot="tabs-trigger"
      className={cn("relative flex h-11 items-center px-3 text-sm font-medium text-stone-500 outline-none transition-colors hover:text-stone-800 focus-visible:ring-2 focus-visible:ring-[#C07A60] data-active:text-stone-800 after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:origin-center after:scale-x-0 after:bg-[#C07A60] after:transition-transform data-active:after:scale-x-100", className)}
      {...props}
    />
  )
}

function TabsContent({ className, ...props }: TabsPrimitive.Panel.Props) {
  return <TabsPrimitive.Panel data-slot="tabs-content" className={cn("min-h-0 flex-1 overflow-y-auto py-4", className)} {...props} />
}

export { Tabs, TabsList, TabsTrigger, TabsContent }