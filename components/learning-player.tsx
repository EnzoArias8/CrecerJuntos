"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, Circle, Download, FileText, MessageCircle, Pause, Play, Send, ShieldCheck } from "lucide-react"

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { CourseReviewForm } from "@/components/CourseReviewForm"
import { createClient } from "@/utils/supabase/client"

type CourseLesson = {
  id: string
  title: string
  description: string
  videoUrl: string
  moduleId: string
  moduleNumber: number
  lessonNumber: number
}

type CourseModule = {
  id: string
  title: string
  lessons: CourseLesson[]
}

const resourceItems = [
  { name: "Guía breve para acompañar una emoción intensa", contents: "Guía de acompañamiento\n\n1. Respira y busca una postura tranquila.\n2. Nombra lo que observas sin juzgar.\n3. Mantén el límite con pocas palabras.\n4. Cuando pase el momento, ofrece conexión y conversa." },
  { name: "Ficha: observar antes de intervenir", contents: "Ficha de observación\n\n¿Qué pasó antes?\n¿Qué puede estar necesitando mi hijo?\n¿Qué me ayudaría a responder con calma?\n¿Qué puedo intentar la próxima vez?" },
]

type LearningPlayerProps = {
  courseId: string
  courseSlug: string
  courseTitle: string
  classId: string
  initials: string
  userId: string
  hasExistingReview: boolean
  modules: CourseModule[]
  completedLessonIds?: string[]
}

export function LearningPlayer({
  courseId,
  courseSlug,
  courseTitle,
  classId,
  initials,
  userId,
  hasExistingReview,
  modules,
  completedLessonIds = [],
}: LearningPlayerProps) {
  const router = useRouter()
  const allLessons = useMemo(
    () => modules.flatMap((module, moduleIndex) => module.lessons.map((lesson) => ({
      ...lesson,
      moduleId: lesson.moduleId || module.id || `module-${moduleIndex + 1}`,
      moduleNumber: lesson.moduleNumber || moduleIndex + 1,
    }))),
    [modules],
  )
  const selectedLesson = allLessons.find((lesson) => lesson.id === classId) ?? allLessons[0]

  const [activeLessonId, setActiveLessonId] = useState(selectedLesson?.id ?? classId)
  const [expandedModules, setExpandedModules] = useState<string[]>(selectedLesson ? [selectedLesson.moduleId] : [])
  const [completedLessons, setCompletedLessons] = useState<string[]>(completedLessonIds)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isSavingCompletion, setIsSavingCompletion] = useState(false)
  const [comments, setComments] = useState(["Gracias por explicar esto con tanta claridad.", "La pausa me ayudó a responder de otra manera hoy."])
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    setCompletedLessons(completedLessonIds)
  }, [completedLessonIds])

  useEffect(() => {
    if (!selectedLesson) return
    setActiveLessonId(selectedLesson.id)
    setExpandedModules((current) => current.includes(selectedLesson.moduleId) ? current : [...current, selectedLesson.moduleId])
  }, [selectedLesson])

  useEffect(() => {
    const storageKey = `crecer-juntos-progress:${courseId}`
    if (completedLessonIds.length > 0) {
      window.localStorage.setItem(storageKey, JSON.stringify(completedLessonIds))
      return
    }

    try {
      const stored = window.localStorage.getItem(storageKey)
      if (!stored) return
      const parsed: unknown = JSON.parse(stored)
      if (Array.isArray(parsed)) {
        const validLessonIds = new Set(allLessons.map((lesson) => lesson.id))
        setCompletedLessons(parsed.filter((lessonId): lessonId is string => typeof lessonId === "string" && validLessonIds.has(lessonId)))
      }
    } catch {
      setCompletedLessons([])
    }
  }, [allLessons, completedLessonIds, courseId])

  useEffect(() => {
    if (completedLessons.length === 0) {
      window.localStorage.setItem(`crecer-juntos-progress:${courseId}`, JSON.stringify([]))
      return
    }
    window.localStorage.setItem(`crecer-juntos-progress:${courseId}`, JSON.stringify(completedLessons))
  }, [completedLessons, courseId])

  if (!selectedLesson) {
    return <div className="flex min-h-screen items-center justify-center bg-stone-50 text-stone-700">No hay clases disponibles para este curso.</div>
  }

  const activeLesson = allLessons.find((lesson) => lesson.id === activeLessonId) ?? selectedLesson
  const isCompleted = completedLessons.includes(activeLesson.id)
  const completedCount = completedLessons.filter((lessonId) => allLessons.some((lesson) => lesson.id === lessonId)).length
  const totalLessons = allLessons.length
  const courseCompleted = totalLessons > 0 && completedCount === totalLessons
  const currentIndex = allLessons.indexOf(activeLesson)
  const prevLesson = currentIndex > 0 ? allLessons[currentIndex - 1] : undefined
  const nextLesson = currentIndex >= 0 ? allLessons[currentIndex + 1] : undefined

  const activeVideo = useMemo(() => {
    const rawUrl = activeLesson.videoUrl?.trim() ?? ""
    if (!rawUrl) return null

    try {
      const parsedUrl = new URL(rawUrl)
      const host = parsedUrl.hostname.replace(/^www\./, "")

      if (host === "youtube.com" || host === "www.youtube.com" || host === "youtu.be" || host === "www.youtu.be" || host === "m.youtube.com") {
        const videoId = parsedUrl.searchParams.get("v") ?? parsedUrl.pathname.split("/").filter(Boolean).pop() ?? ""
        if (videoId) {
          return { type: "youtube", src: `https://www.youtube.com/embed/${videoId}?rel=0` }
        }
      }

      if (host === "vimeo.com" || host === "player.vimeo.com") {
        const videoId = parsedUrl.pathname.split("/").filter(Boolean).at(-1) ?? ""
        if (videoId) {
          return { type: "vimeo", src: `https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0` }
        }
      }
    } catch {
      // Si la URL no es válida como URL, se renderiza como video directo si es un archivo de video.
    }

    return { type: "direct", src: rawUrl }
  }, [activeLesson.videoUrl])

  function selectLesson(lessonId: string, moduleId: string) {
    setActiveLessonId(lessonId)
    setIsPlaying(false)
    setExpandedModules((current) => current.includes(moduleId) ? current : [...current, moduleId])
    router.push(`/mis-cursos/${courseSlug}/${lessonId}`, { scroll: false })
  }

  function toggleCompletion() {
    void marcarClaseCompletada()
  }

  async function marcarClaseCompletada() {
    if (isCompleted || isSavingCompletion) return

    const supabase = createClient()
    const claseIdToStore = activeLesson.id

    setIsSavingCompletion(true)

    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser()

      if (authError || !user) {
        console.error("No se pudo obtener el usuario:", authError)
        return
      }

      const userId = user.id
      const { data: existingProgress, error: lookupError } = await supabase
        .from("progreso_clases")
        .select("id")
        .eq("usuario_id", userId)
        .eq("curso_id", courseId)
        .eq("clase_id", claseIdToStore)
        .limit(1)
        .maybeSingle()

      if (lookupError) throw new Error(lookupError.message + " (Código: " + lookupError.code + ")")

      if (existingProgress) {
        setCompletedLessons((current) => (current.includes(activeLesson.id) ? current : [...current, activeLesson.id]))
        router.refresh()
        return
      }

      const { error } = await supabase
        .from("progreso_clases")
        .insert({
          usuario_id: userId,
          curso_id: courseId,
          clase_id: claseIdToStore,
          completada: true,
        })

      if (error) throw new Error(error.message + " (Código: " + error.code + ")")

      setCompletedLessons((current) => (current.includes(activeLesson.id) ? current : [...current, activeLesson.id]))
      router.refresh()
      if (nextLesson) router.push(`/mis-cursos/${courseSlug}/${nextLesson.id}`, { scroll: false })
    } catch (error) {
      console.error("Error al guardar la clase como completada:", error)
    } finally {
      setIsSavingCompletion(false)
    }
  }

  function submitComment(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const comment = newComment.trim()
    if (!comment) return
    setComments((current) => [comment, ...current])
    setNewComment("")
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-stone-50 text-stone-800">
      <header className="z-10 flex h-14 shrink-0 items-center justify-between border-b border-stone-200 bg-white px-4 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Button nativeButton={false} render={<Link href="/mis-cursos" />} variant="ghost" size="icon" className="shrink-0 text-stone-600" aria-label="Volver a mis cursos"><ArrowLeft /></Button>
          <div className="min-w-0 border-l border-stone-200 pl-3">
            <p className="truncate text-sm font-semibold">{courseTitle}</p>
            <p className="hidden truncate text-xs text-stone-500 sm:block">Tu espacio de aprendizaje</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="hidden items-center gap-1.5 text-xs text-stone-500 sm:flex"><ShieldCheck className="size-4 text-[#54745c]" /> Progreso guardado</span>
          <Avatar className="size-8"><AvatarFallback className="text-xs">{initials}</AvatarFallback></Avatar>
        </div>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="flex min-h-[150px] flex-[0_0_38%] items-center justify-center bg-[#171717] p-3 sm:flex-[0_0_43%] lg:min-h-0 lg:flex-[0_0_56%] lg:p-5">
            <div className="relative flex aspect-video h-full max-w-full items-center justify-center overflow-hidden bg-black text-white shadow-2xl">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(76,70,65,0.28),_transparent_68%)]" />
              {activeVideo ? (
                activeVideo.type === "youtube" || activeVideo.type === "vimeo" ? (
                  <iframe
                    src={activeVideo.src}
                    title={activeLesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                    className="absolute inset-0 h-full w-full"
                  />
                ) : (
                  <video src={activeVideo.src} controls className="absolute inset-0 h-full w-full object-cover" />
                )
              ) : (
                <div className="relative z-10 flex flex-col items-center gap-3 text-center">
                  <span className="flex size-16 items-center justify-center rounded-full border border-white/25 bg-white/10 backdrop-blur-sm sm:size-[76px]">
                    <Play className="ml-1 size-8 fill-white sm:size-9" aria-hidden="true" />
                  </span>
                  <span className="text-xs font-medium tracking-wide text-white/70">Clase en video</span>
                </div>
              )}
              {!activeLesson.videoUrl && (
                <Button onClick={() => setIsPlaying((current) => !current)} variant="ghost" size="icon" className="absolute inset-0 z-20 size-full cursor-pointer rounded-none opacity-0" aria-label={isPlaying ? "Pausar video" : "Reproducir video"}>
                  {isPlaying ? <Pause /> : <Play />}
                </Button>
              )}
              {!activeLesson.videoUrl && (
                <div className="absolute inset-x-0 bottom-0 z-30 flex items-center gap-3 bg-gradient-to-t from-black/80 to-transparent px-4 pb-3 pt-8 text-xs text-white/80">
                  <button type="button" onClick={() => setIsPlaying((current) => !current)} className="rounded p-1 outline-none hover:text-white focus-visible:ring-2 focus-visible:ring-white" aria-label={isPlaying ? "Pausar video" : "Reproducir video"}>
                    {isPlaying ? <Pause className="size-4" /> : <Play className="size-4 fill-current" />}
                  </button>
                  <span>{isPlaying ? "00:18" : "00:00"}</span>
                  <div className="h-1 flex-1 rounded-full bg-white/30"><div className={`h-full rounded-full bg-[#d39a7f] ${isPlaying ? "w-[12%]" : "w-0"}`} /></div>
                  <span>08:42</span>
                </div>
              )}
            </div>
          </div>

          <section className="flex shrink-0 items-center justify-between gap-3 border-b border-stone-200 bg-white px-4 py-3 sm:px-6">
            <div className="min-w-0">
              <p className="text-xs font-medium text-[#54745c]">Módulo {activeLesson.moduleNumber} · Clase {activeLesson.lessonNumber}</p>
              <h1 className="mt-0.5 truncate text-base font-semibold sm:text-lg">{activeLesson.moduleNumber}.{activeLesson.lessonNumber} {activeLesson.title}</h1>
            </div>
            <Button
              onClick={toggleCompletion}
              disabled={isCompleted || isSavingCompletion}
              variant={isCompleted ? "secondary" : "outline"}
              className={`h-9 shrink-0 rounded-lg px-3 text-xs sm:text-sm ${isCompleted ? "bg-[#e4eee3] text-[#45624c] hover:bg-[#dce9dc]" : "border-stone-300 bg-white text-stone-700"}`}
            >
              {isCompleted ? <Check data-icon="inline-start" /> : null}
              <span className="hidden sm:inline">{isSavingCompletion ? "Guardando..." : isCompleted ? "Completada" : "Marcar como completada"}</span>
              <span className="sm:hidden">{isSavingCompletion ? "Guardando..." : isCompleted ? "Completada" : "Completar"}</span>
            </Button>
          </section>

          <section className="flex-1 bg-white px-4 py-4 sm:px-6">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-[0.14em] text-[#54745c]">Descripción</h2>
            <div className="space-y-3 text-sm leading-6 text-stone-600">
              <p>{activeLesson.description || "En esta clase exploramos qué puede estar comunicando un berrinche y cómo acompañar a tu hijo con calma, sin perder de vista sus necesidades ni tus propios límites."}</p>
              <p>No se trata de evitar todas las emociones intensas, sino de ofrecer presencia y seguridad mientras pasan. Observa, respira y recuerda que primero va la conexión; después, la conversación.</p>
              {nextLesson && <p className="pt-1 text-xs text-stone-500">Siguiente: {nextLesson.title}</p>}
            </div>
          </section>
        </main>

        <aside className="flex min-h-0 flex-[0_0_34%] flex-col border-t border-stone-200 bg-white lg:h-full lg:flex-none lg:w-80 lg:border-l lg:border-t-0 xl:w-96" aria-label="Contenido del curso">
          <div className="flex shrink-0 items-center justify-between border-b border-stone-200 px-4 py-3.5 sm:px-5">
            <div>
              <h2 className="font-semibold text-stone-800">Contenido del curso</h2>
              <p className="mt-1 text-xs text-stone-500">{completedCount} de {totalLessons} clases completadas</p>
            </div>
            <span className="text-sm font-semibold tabular-nums text-[#54745c]">{totalLessons > 0 ? Math.round(completedCount / totalLessons * 100) : 0}%</span>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-4 sm:px-5">
            <Accordion multiple value={expandedModules} onValueChange={setExpandedModules} className="divide-y divide-stone-200">
              {modules.map((module, moduleIndex) => {
                const moduleId = module.id || `module-${moduleIndex + 1}`
                return (
                  <AccordionItem key={moduleId} value={moduleId} className="border-0">
                    <AccordionTrigger className="gap-3 py-4 hover:text-stone-900">
                      <span className="flex min-w-0 items-center gap-3 text-left">
                        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-stone-100 text-xs font-semibold text-stone-600">{String(moduleIndex + 1).padStart(2, "0")}</span>
                        <span className="min-w-0">
                          <span className="block text-sm leading-5">{module.title}</span>
                          <span className="mt-1 block text-[11px] font-normal text-stone-500">{module.lessons.length} clases</span>
                        </span>
                      </span>
                    </AccordionTrigger>
                    <AccordionContent className="pb-3">
                      <ul className="space-y-1">
                        {module.lessons.map((lesson) => {
                          const isActive = activeLesson.id === lesson.id
                          const isLessonCompleted = completedLessons.includes(lesson.id)
                          return (
                            <li key={lesson.id}>
                              <button
                                type="button"
                                onClick={() => selectLesson(lesson.id, moduleId)}
                                aria-current={isActive ? "true" : undefined}
                                className={`flex w-full items-start gap-2.5 rounded-lg px-2.5 py-2 text-left text-xs leading-5 transition-colors ${isActive ? "bg-[#f6eee9] text-[#8e5846]" : "text-stone-600 hover:bg-stone-50 hover:text-stone-800"}`}
                              >
                                <span className="mt-0.5 shrink-0">
                                  {isLessonCompleted ? <Check className="size-4 text-[#54745c]" aria-label="Completada" /> : <Circle className="size-4 text-stone-300" aria-label="Pendiente" />}
                                </span>
                                <span className="min-w-0 flex-1">{lesson.moduleNumber}.{lesson.lessonNumber} {lesson.title}</span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </AccordionContent>
                  </AccordionItem>
                )
              })}
            </Accordion>
            {courseCompleted && (
              <section aria-labelledby="course-review-title" className="mt-5 space-y-3 border-t border-stone-200 pt-5">
                <div>
                  <h3 id="course-review-title" className="font-semibold text-stone-800">¡Felicitaciones por completar el curso!</h3>
                  <p className="mt-1 text-sm leading-5 text-stone-500">Si quieres, comparte tu experiencia con otras familias.</p>
                </div>
                <CourseReviewForm usuarioId={userId} cursoSlug={courseSlug} hasExistingReview={hasExistingReview} />
              </section>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2 border-t border-stone-200 p-3 sm:p-4">
            <Button
              onClick={() => prevLesson && selectLesson(prevLesson.id, prevLesson.moduleId)}
              disabled={!prevLesson}
              variant="secondary"
              className="flex h-10 w-full items-center justify-center rounded-lg text-xs text-stone-700 disabled:opacity-45 sm:text-sm"
            >
              Clase anterior
            </Button>
            <Button
              onClick={() => nextLesson && selectLesson(nextLesson.id, nextLesson.moduleId)}
              disabled={!nextLesson}
              variant="outline"
              className="flex h-10 w-full items-center justify-center rounded-lg border-stone-300 bg-white text-xs text-stone-700 hover:bg-stone-50 disabled:opacity-45 sm:text-sm"
            >
              Siguiente clase
            </Button>
          </div>
        </aside>
      </div>
    </div>
  )
}