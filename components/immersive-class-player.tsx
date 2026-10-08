'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Check, Circle, Pause, Play, SkipBack, SkipForward } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Progress, ProgressTrack } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const classes = [
	{ id: 'lesson-1', module: 1, title: 'Bienvenida y objetivos', duration: '03:40', complete: true },
	{ id: 'lesson-2', module: 1, title: 'Qué hacer frente a una emergencia', duration: '08:42', complete: false },
	{ id: 'lesson-3', module: 2, title: 'RCP solo manos: pasos esenciales', duration: '12:15', complete: false },
	{ id: 'lesson-4', module: 2, title: 'RCP para bebés y niños', duration: '10:30', complete: false },
	{ id: 'lesson-5', module: 2, title: 'Desobstrucción de la vía aérea', duration: '09:18', complete: false },
]

const classModules = [
	{ id: 1, title: 'MÓDULO 1 · FUNDAMENTOS' },
	{ id: 2, title: 'MÓDULO 2 · PRACTICAR PARA CUIDAR' },
]

export function ImmersiveClassPlayer({ initials }: { initials: string }) {
	const [activeClassId, setActiveClassId] = useState('lesson-2')
	const [isPlaying, setIsPlaying] = useState(false)
	const [isCurrentComplete, setIsCurrentComplete] = useState(false)
	const activeIndex = classes.findIndex((lesson) => lesson.id === activeClassId)
	const activeClass = classes[activeIndex]
	const completedCount = 1 + (isCurrentComplete ? 1 : 0)
	const progress = isCurrentComplete ? 60 : 45

	function selectClass(id: string) {
		setActiveClassId(id)
		setIsCurrentComplete(false)
		setIsPlaying(false)
	}

	function goToClass(index: number) {
		const nextClass = classes[index]
		if (nextClass) selectClass(nextClass.id)
	}

	return (
		<div className="flex h-dvh flex-col overflow-hidden bg-stone-50 text-stone-800">
			<header className="grid h-16 shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b border-stone-200 bg-white px-3 sm:px-5">
				<div className="min-w-0"><Link href="/mis-cursos" className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm text-stone-500 transition-colors hover:bg-stone-50 hover:text-stone-800 sm:px-3"><ArrowLeft className="size-4 shrink-0" /><span className="hidden sm:inline">Volver a Mis Cursos</span><span className="sm:hidden">Mis Cursos</span></Link></div>
				<p className="max-w-[38vw] truncate text-center text-xs font-semibold text-stone-800 sm:max-w-none sm:text-sm">RCP y desobstrucción de la vía aérea</p>
				<div className="flex items-center justify-end gap-2 sm:gap-3"><span className="hidden whitespace-nowrap text-xs font-medium text-stone-500 sm:inline">{progress}% completado</span><Avatar className="size-8 ring-1 ring-stone-200"><AvatarFallback className="bg-[#e7f0e7] text-[11px] text-[#45624c]">{initials}</AvatarFallback></Avatar></div>
			</header>

			<main className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row">
				<section className="flex min-h-0 min-w-0 flex-[0_0_62%] flex-col overflow-y-auto p-4 sm:p-6 lg:flex-1" aria-label="Reproductor y contenido de la clase">
					<div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-xl bg-stone-800 text-white shadow-sm">
						<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(115,99,84,0.24),_transparent_66%)]" />
						<button type="button" onClick={() => setIsPlaying((playing) => !playing)} aria-label={isPlaying ? 'Pausar clase' : 'Reproducir clase'} className="absolute inset-0 z-10 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white"><span className="flex size-16 items-center justify-center rounded-full border border-white/25 bg-white/10 text-white shadow-lg backdrop-blur-sm transition-transform hover:scale-105 sm:size-[76px]">{isPlaying ? <Pause className="size-7 fill-white sm:size-8" /> : <Play className="ml-1 size-7 fill-white sm:size-8" />}</span></button>
						<div className="absolute inset-x-0 bottom-0 flex items-center gap-3 bg-gradient-to-t from-black/75 to-transparent px-4 pb-3 pt-8 text-xs text-white/75"><button type="button" onClick={() => setIsPlaying((playing) => !playing)} aria-label={isPlaying ? 'Pausar clase' : 'Reproducir clase'} className="rounded p-1 hover:text-white">{isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}</button><span>{isPlaying ? '02:18' : '00:00'}</span><div className="h-1 flex-1 rounded-full bg-white/30"><div className={`h-full rounded-full bg-[#C07A60] ${isPlaying ? 'w-[28%]' : 'w-0'}`} /></div><span>{activeClass.duration}</span></div>
					</div>

					<div className="mt-6 flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-400">CLASE {String(activeIndex + 1).padStart(2, '0')} · MÓDULO {activeClass.module}</p><h1 className="mt-2 text-2xl font-semibold leading-tight text-stone-800 sm:text-3xl">{activeClass.title}</h1></div><div className="flex shrink-0 flex-wrap gap-2"><Button onClick={() => setIsCurrentComplete((complete) => !complete)} variant="outline" className={`h-9 rounded-lg border-stone-300 bg-white px-3 text-xs sm:text-sm ${isCurrentComplete ? 'border-[#d5e2d2] bg-[#f0f5ef] text-[#45624c]' : 'text-stone-700'}`}>{isCurrentComplete ? <Check data-icon="inline-start" /> : <Check data-icon="inline-start" className="text-stone-400" />}{isCurrentComplete ? 'Completada' : 'Marcar como completada'}</Button></div></div>

					<div className="mt-4 flex items-center justify-between gap-3 border-b border-stone-200 pb-5"><Button onClick={() => goToClass(activeIndex - 1)} disabled={activeIndex === 0} variant="ghost" className="h-9 rounded-lg px-2 text-xs text-stone-600 hover:bg-stone-100 sm:px-3 sm:text-sm"><SkipBack data-icon="inline-start" /> Anterior</Button><Button onClick={() => goToClass(activeIndex + 1)} disabled={activeIndex === classes.length - 1} className="h-9 rounded-lg bg-[#C07A60] px-3 text-xs text-white hover:bg-[#a9634d] sm:px-4 sm:text-sm">Siguiente clase <SkipForward data-icon="inline-end" /></Button></div>

					<Tabs defaultValue="description" className="min-h-[220px] flex-1 bg-transparent">
						<TabsList aria-label="Información de la clase"><TabsTrigger value="description">Descripción</TabsTrigger><TabsTrigger value="materials">Materiales</TabsTrigger><TabsTrigger value="comments">Comentarios</TabsTrigger></TabsList>
						<TabsContent value="description" className="text-sm leading-7 text-stone-600 sm:text-base"><p>Ante una emergencia, lo primero es detenerse un instante, respirar y observar qué está ocurriendo. Mantener la calma ayuda a evaluar la situación, reconocer los riesgos y pedir ayuda con claridad.</p><p className="mt-3">En esta clase repasamos una secuencia sencilla para actuar de forma segura mientras llega asistencia. El contenido es educativo y no reemplaza la formación práctica ni las indicaciones de los servicios de emergencia.</p></TabsContent>
						<TabsContent value="materials" className="text-sm leading-6 text-stone-600 sm:text-base"><div className="rounded-xl border border-stone-200 bg-white p-4"><p className="font-medium text-stone-800">Guía rápida de respuesta</p><p className="mt-1">Material de repaso para acompañar el contenido de esta clase.</p></div></TabsContent>
						<TabsContent value="comments" className="text-sm leading-6 text-stone-600 sm:text-base"><p>Comparte tus preguntas en el espacio de comunidad del curso.</p></TabsContent>
					</Tabs>
				</section>

				<aside className="flex min-h-0 flex-[0_0_38%] flex-col border-t border-stone-200 bg-stone-50 px-4 py-4 lg:h-full lg:flex-none lg:w-80 lg:border-l lg:border-t-0 lg:px-5 lg:py-6 xl:w-96" aria-label="Temario del curso">
					<div className="shrink-0 pb-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400">Tu recorrido</p><h2 className="mt-1 text-lg font-semibold text-stone-800">Contenido del curso</h2><div className="mt-4 flex items-center justify-between text-xs"><span className="font-medium text-stone-600">{progress}% completado</span><span className="text-stone-500">{completedCount + 1} de 5 clases</span></div><Progress value={progress} aria-label="Progreso del curso" aria-valuetext={`${progress}% completado`} className="mt-2"><ProgressTrack /></Progress></div>
					<div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{classModules.map((module) => <section key={module.id} className="pb-3"><h3 className="px-2 pb-2 pt-3 text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-400">{module.title}</h3><div className="space-y-1">{classes.filter((lesson) => lesson.module === module.id).map((lesson) => {const isActive = activeClassId === lesson.id;const isComplete = lesson.complete || (lesson.id === 'lesson-2' && isCurrentComplete);return <button key={lesson.id} type="button" onClick={() => selectClass(lesson.id)} aria-current={isActive ? 'true' : undefined} className={`flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2.5 text-left transition-colors ${isActive ? 'bg-[#f4e9e4] ring-1 ring-[#ecd9d0]' : 'hover:bg-white'}`}><span className="flex size-7 shrink-0 items-center justify-center">{isComplete ? <Check className="size-4 rounded-full bg-[#e3eee1] p-0.5 text-[#54745c]" /> : isActive ? <Play className="size-4 fill-[#C07A60] text-[#C07A60]" /> : <Circle className="size-4 text-stone-300" />}</span><span className="min-w-0 flex-1"><span className={`block text-xs font-medium leading-5 ${isActive ? 'text-[#8e5846]' : 'text-stone-700'}`}>{lesson.title}</span>{isActive && <span className="mt-0.5 block text-[10px] font-medium text-[#a66b56]">Reproduciendo ahora</span>}</span><span className="shrink-0 text-[10px] tabular-nums text-stone-400">{lesson.duration}</span></button>})}</div></section>)}</div>
				</aside>
			</main>
		</div>
	)
}