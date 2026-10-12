'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, BookOpen, CirclePlus, Plus, Trash2 } from 'lucide-react'

import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/utils/supabase/client'

type Instructor = {
  id: string | number
  nombre: string
  profesion: string | null
  imagen_url: string | null
}

export type CourseLessonDraft = {
  id: string
  title: string
  description: string
  videoUrl: string
}

export type CourseModuleDraft = {
  id: string
  title: string
  lessons: CourseLessonDraft[]
}

export type CourseFormValues = {
  name: string
  category: string
  price: string
  priceUsd: string
  imageUrl: string
  shortDescription: string
  description: string
  learningObjectives: string
  audience: string
  modality: string
  topics: string
  instructors: string[]
  modules: CourseModuleDraft[]
}

export type CourseFormInitialData = Partial<CourseFormValues> & { id?: string | number }

type CourseFormProps = {
  title: 'Agregar nuevo curso' | 'Editar curso'
  submitLabel: 'Guardar curso' | 'Guardar cambios'
  initialData?: CourseFormInitialData
}

const createLesson = (id: string): CourseLessonDraft => ({ id, title: '', description: '', videoUrl: '' })

const starterModules: CourseModuleDraft[] = [
  {
    id: 'module-1',
    title: 'Módulo 1: Primeros pasos',
    lessons: [
      { id: '', title: '', description: '', videoUrl: '' },
    ],
  },
]

function createId(prefix: string) {
	const id = globalThis.crypto.randomUUID()
	return prefix === 'lesson' ? id : `${prefix}-${id}`
}

function normalizeLessonId(value: string) {
	const candidate = value.startsWith('lesson-') ? value.slice('lesson-'.length) : value
	return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(candidate)
		? candidate.toLowerCase()
		: globalThis.crypto.randomUUID()
}

const generarSlug = (t: string) => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-+|-+$/g, '')

export function CourseForm({ title, submitLabel, initialData }: CourseFormProps) {
  const router = useRouter()
  const isCreating = !initialData?.id
  const [imagenFile, setImagenFile] = useState<File | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')
  const [instructors, setInstructors] = useState<Instructor[]>([])
  const [instructorsError, setInstructorsError] = useState('')
  const [isInstructorDialogOpen, setIsInstructorDialogOpen] = useState(false)
  const [instructorName, setInstructorName] = useState('')
  const [instructorProfession, setInstructorProfession] = useState('')
  const [instructorPhoto, setInstructorPhoto] = useState<File | null>(null)
  const [instructorSaveError, setInstructorSaveError] = useState('')
  const [isSavingInstructor, setIsSavingInstructor] = useState(false)
  const [fields, setFields] = useState(() => ({
    name: initialData?.name ?? '',
    category: initialData?.category ?? '',
    price: initialData?.price ?? '',
    priceUsd: initialData?.priceUsd ?? '',
    imageUrl: initialData?.imageUrl ?? '',
    shortDescription: initialData?.shortDescription ?? '',
    description: initialData?.description ?? '',
    learningObjectives: initialData?.learningObjectives ?? '',
    audience: initialData?.audience ?? '',
    modality: initialData?.modality ?? '',
    topics: initialData?.topics ?? '',
    instructors: initialData?.instructors ?? [],
  }))
  const [modules, setModules] = useState<CourseModuleDraft[]>(initialData?.modules?.length ? initialData.modules : starterModules)
  const totalLessons = modules.reduce((total, module) => total + module.lessons.length, 0)

  useEffect(() => {
    let isMounted = true

    async function loadInstructors() {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('autores')
        .select('id, nombre, profesion, imagen_url')
        .order('nombre')

      if (!isMounted) return
      if (error) {
        setInstructorsError(`No se pudieron cargar los instructores: ${error.message}`)
        return
      }

      setInstructors(data ?? [])
    }

    void loadInstructors()
    return () => {
      isMounted = false
    }
  }, [])

  useEffect(() => {
    setFields({
      name: initialData?.name ?? '',
      category: initialData?.category ?? '',
      price: initialData?.price ?? '',
      priceUsd: initialData?.priceUsd ?? '',
      imageUrl: initialData?.imageUrl ?? '',
      shortDescription: initialData?.shortDescription ?? '',
      description: initialData?.description ?? '',
      learningObjectives: initialData?.learningObjectives ?? '',
      audience: initialData?.audience ?? '',
      modality: initialData?.modality ?? '',
      topics: initialData?.topics ?? '',
      instructors: initialData?.instructors ?? [],
    })
    setModules(initialData?.modules?.length ? initialData.modules : starterModules)
  }, [initialData])

  function updateField(field: keyof typeof fields, value: string) {
    setFields((current) => ({ ...current, [field]: value }))
  }

  function toggleInstructor(instructor: string) {
    setFields((current) => ({
      ...current,
      instructors: current.instructors.includes(instructor)
        ? current.instructors.filter((selected) => selected !== instructor)
        : [...current.instructors, instructor],
    }))
  }

  async function handleAddInstructor(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setInstructorSaveError('')

    const name = instructorName.trim()
    const profession = instructorProfession.trim()
    if (!name || !profession || !instructorPhoto) {
      setInstructorSaveError('Completa el nombre, la profesión y selecciona una foto.')
      return
    }

    setIsSavingInstructor(true)
    const supabase = createClient()
    let uploadedPath: string | null = null

    try {
      const safeFileName = instructorPhoto.name.replace(/[^a-zA-Z0-9._-]/g, '-')
      const storagePath = `${globalThis.crypto.randomUUID()}-${safeFileName}`
      const { data: uploadedFile, error: uploadError } = await supabase.storage
        .from('autores')
        .upload(storagePath, instructorPhoto, { contentType: instructorPhoto.type, upsert: false })

      if (uploadError) throw new Error(`No se pudo subir la foto: ${uploadError.message}`)
      uploadedPath = uploadedFile.path

      const { data: publicUrlData } = supabase.storage.from('autores').getPublicUrl(uploadedFile.path)
      const { data: instructor, error: insertError } = await supabase
        .from('autores')
        .insert({
          nombre: name,
          profesion: profession,
          imagen_url: publicUrlData.publicUrl,
        })
        .select('id, nombre, profesion, imagen_url')
        .single()

      if (insertError) {
        const { error: cleanupError } = await supabase.storage.from('autores').remove([uploadedFile.path])
        uploadedPath = null
        const cleanupMessage = cleanupError ? ` No se pudo limpiar la foto subida: ${cleanupError.message}` : ''
        throw new Error(`No se pudo guardar el instructor: ${insertError.message}.${cleanupMessage}`)
      }
      if (!instructor) throw new Error('Supabase no devolvió el instructor guardado.')

      setInstructors((current) => [...current, instructor].sort((first, second) => first.nombre.localeCompare(second.nombre)))
      setFields((current) => ({
        ...current,
        instructors: current.instructors.includes(instructor.nombre)
          ? current.instructors
          : [...current.instructors, instructor.nombre],
      }))
      setInstructorName('')
      setInstructorProfession('')
      setInstructorPhoto(null)
      setIsInstructorDialogOpen(false)
    } catch (error) {
      if (uploadedPath) {
        const { error: cleanupError } = await supabase.storage.from('autores').remove([uploadedPath])
        if (cleanupError) {
          setInstructorSaveError(`${error instanceof Error ? error.message : 'No se pudo guardar el instructor.'} No se pudo limpiar la foto subida: ${cleanupError.message}`)
          setIsSavingInstructor(false)
          return
        }
      }
      setInstructorSaveError(error instanceof Error ? error.message : 'No se pudo guardar el instructor.')
    } finally {
      setIsSavingInstructor(false)
    }
  }

  function updateModuleTitle(moduleId: string, value: string) {
    setModules((current) => current.map((module) => module.id === moduleId ? { ...module, title: value } : module))
  }

  function updateLesson(moduleId: string, lessonId: string, field: keyof Omit<CourseLessonDraft, 'id'>, value: string) {
    setModules((current) => current.map((module) => module.id === moduleId
      ? { ...module, lessons: module.lessons.map((lesson) => lesson.id === lessonId ? { ...lesson, [field]: value } : lesson) }
      : module))
  }

  function addModule() {
    const id = createId('module')
    setModules((current) => [...current, { id, title: `Módulo ${current.length + 1}: Nuevo módulo`, lessons: [createLesson(createId('lesson'))] }])
  }

  function removeModule(moduleId: string) {
    setModules((current) => current.filter((module) => module.id !== moduleId))
  }

  function addLesson(moduleId: string) {
    setModules((current) => current.map((module) => module.id === moduleId
      ? { ...module, lessons: [...module.lessons, createLesson(createId('lesson'))] }
      : module))
  }

  function removeLesson(moduleId: string, lessonId: string) {
    setModules((current) => current.map((module) => module.id === moduleId
      ? { ...module, lessons: module.lessons.filter((lesson) => lesson.id !== lessonId) }
      : module))
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    setIsSubmitting(true)
    setSubmitError('')

    try {
      if (isCreating && !imagenFile) throw new Error('Selecciona una imagen de portada.')

      const supabase = createClient()
      let imageUrl = initialData?.imageUrl ?? ''

      if (imagenFile) {
        const safeFileName = imagenFile.name.replace(/[^a-zA-Z0-9._-]/g, '-')
        const { data: uploadedImage, error: uploadError } = await supabase.storage
          .from('cursos')
          .upload(`${Date.now()}-${safeFileName}`, imagenFile, { contentType: imagenFile.type })

        if (uploadError) throw new Error(uploadError.message)

        const { data: imageData } = supabase.storage.from('cursos').getPublicUrl(uploadedImage.path)
        imageUrl = imageData.publicUrl
      }

      if (!imageUrl) throw new Error('Selecciona una imagen de portada.')

      const payload = {
        titulo: fields.name.trim(),
        slug: generarSlug(fields.name),
        precio_ars: Number(fields.price),
        imagen_url: imageUrl,
        categoria: fields.category || null,
        precio_usd: fields.priceUsd ? Number(fields.priceUsd) : null,
        descripcion_corta: fields.shortDescription || null,
        descripcion_completa: fields.description || null,
        que_aprenderan: fields.learningObjectives || null,
        dirigido_a: fields.audience || null,
        modalidad: fields.modality || null,
        temas_principales: fields.topics || null,
        instructores: fields.instructors,
        temario: modules.map((module) => ({
          ...module,
          lessons: module.lessons.map((lesson) => ({ ...lesson, id: normalizeLessonId(lesson.id) })),
        })),
      }

      const { error: saveError } = initialData?.id
        ? await supabase.from('cursos').update(payload).eq('id', initialData.id)
        : await supabase.from('cursos').insert(payload)

      if (saveError) throw new Error(saveError.message)

      router.push('/admin/cursos')
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'No se pudo guardar el curso.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section className="mx-auto max-w-3xl">
      <Link href="/admin/cursos" className="mb-5 inline-flex items-center gap-2 text-sm text-stone-500 transition-colors hover:text-stone-800">
        <ArrowLeft className="size-4" /> Volver al catálogo
      </Link>

      <div className="mb-7">
        <p className="flex items-center gap-2 text-sm font-medium text-[#54745c]"><BookOpen className="size-4" /> CATÁLOGO EDUCATIVO</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-stone-800 sm:text-[28px]">{title}</h1>
        <p className="mt-1.5 text-sm text-stone-500">Completa los datos principales del curso</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card className="rounded-xl border-stone-200 bg-white py-0 shadow-sm">
          <CardContent className="p-5 sm:p-7">
            <div className="mb-6"><h2 className="text-lg font-semibold text-stone-800">Información General</h2><p className="mt-1 text-sm text-stone-500">Los datos que identificarán el curso en el catálogo.</p></div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div className="space-y-2 sm:col-span-2"><label htmlFor="course-name" className="text-sm font-medium text-stone-700">Nombre del curso</label><Input id="course-name" name="name" required value={fields.name} onChange={(event) => updateField('name', event.target.value)} placeholder="Ej. Acompañar sin gritos" className="h-11 rounded-lg border-stone-300 bg-white px-3" /></div>
              <div className="space-y-2"><label htmlFor="course-category" className="text-sm font-medium text-stone-700">Categoría</label><Input id="course-category" name="category" required value={fields.category} onChange={(event) => updateField('category', event.target.value)} placeholder="Ej. Crianza" className="h-11 rounded-lg border-stone-300 bg-white px-3" /></div>
              <div className="space-y-2"><label htmlFor="course-price" className="text-sm font-medium text-stone-700">Precio</label><div className="relative"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">$</span><Input id="course-price" name="price" type="number" min="0" step="100" required value={fields.price} onChange={(event) => updateField('price', event.target.value)} placeholder="24900" className="h-11 rounded-lg border-stone-300 bg-white pl-7" /></div></div>
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="course-image" className="text-sm font-medium text-stone-700">Imagen de portada</label>
                <input id="course-image" name="image" type="file" accept="image/*" required={isCreating} onChange={(event) => setImagenFile(event.target.files?.[0] ?? null)} className="block w-full rounded-lg border border-stone-300 bg-white px-3 py-2 text-sm text-stone-700 file:mr-4 file:rounded-md file:border-0 file:bg-[#edf1e9] file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-[#45624c]" />
                {imagenFile ? <p className="text-xs text-stone-500">{imagenFile.name}</p> : initialData?.imageUrl && <p className="text-xs text-stone-400">Se conservará la portada actual si no seleccionas otra.</p>}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-stone-200 bg-white py-0 shadow-sm">
          <CardContent className="p-5 sm:p-7">
            <div className="mb-6"><h2 className="text-lg font-semibold text-stone-800">Detalles del Curso</h2><p className="mt-1 text-sm text-stone-500">Cuéntales a las familias qué encontrarán y qué podrán aprender.</p></div>
            <div className="space-y-5">
              <div className="space-y-2"><label htmlFor="course-short-description" className="text-sm font-medium text-stone-700">Descripción corta</label><Textarea id="course-short-description" name="shortDescription" required value={fields.shortDescription} onChange={(event) => updateField('shortDescription', event.target.value)} placeholder="Un subtítulo breve para presentar el curso." className="min-h-24 resize-y rounded-lg border-stone-300 bg-white" /></div>
              <div className="space-y-2"><label htmlFor="course-description" className="text-sm font-medium text-stone-700">Descripción completa</label><Textarea id="course-description" name="description" required value={fields.description} onChange={(event) => updateField('description', event.target.value)} placeholder="Describe el enfoque, los contenidos y cómo este curso acompañará a las familias." className="min-h-40 resize-y rounded-lg border-stone-300 bg-white" /></div>
              <div className="space-y-2"><label htmlFor="course-objectives" className="text-sm font-medium text-stone-700">¿Qué aprenderán las familias?</label><Textarea id="course-objectives" name="learningObjectives" required value={fields.learningObjectives} onChange={(event) => updateField('learningObjectives', event.target.value)} placeholder={'Escribe un objetivo por línea.\nReconocer las necesidades detrás de una conducta.\nAcompañar con límites respetuosos.'} className="min-h-32 resize-y rounded-lg border-stone-300 bg-white" /></div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-stone-200 bg-white py-0 shadow-sm">
          <CardContent className="p-5 sm:p-7">
            <div className="mb-6"><h2 className="text-lg font-semibold text-stone-800">Datos de Venta y Landing</h2><p className="mt-1 text-sm text-stone-500">Completa la información que verán las familias en la página pública del curso.</p></div>
            <div className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="course-price-usd" className="text-sm font-medium text-stone-700">Precio en Dólares</label>
                <div className="relative max-w-sm"><span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">USD</span><Input id="course-price-usd" name="priceUsd" type="number" min="0" step="1" value={fields.priceUsd} onChange={(event) => updateField('priceUsd', event.target.value)} placeholder="24" className="h-11 rounded-lg border-stone-300 bg-white pl-12" /></div>
              </div>
              <div className="space-y-2"><label htmlFor="course-audience" className="text-sm font-medium text-stone-700">¿A quién está dirigido?</label><Textarea id="course-audience" name="audience" value={fields.audience} onChange={(event) => updateField('audience', event.target.value)} placeholder="Describe qué familias aprovecharán mejor este curso." className="min-h-24 resize-y rounded-lg border-stone-300 bg-white" /></div>
              <div className="space-y-2"><label htmlFor="course-modality" className="text-sm font-medium text-stone-700">Modalidad</label><Textarea id="course-modality" name="modality" value={fields.modality} onChange={(event) => updateField('modality', event.target.value)} placeholder="Clases grabadas, breves y prácticas..." className="min-h-24 resize-y rounded-lg border-stone-300 bg-white" /></div>
              <div className="space-y-2"><label htmlFor="course-topics" className="text-sm font-medium text-stone-700">Temas que vemos</label><Textarea id="course-topics" name="topics" value={fields.topics} onChange={(event) => updateField('topics', event.target.value)} placeholder={'Escribe los temas principales, uno por línea.\nLímites respetuosos\nRegulación emocional'} className="min-h-32 resize-y rounded-lg border-stone-300 bg-white" /></div>
              <fieldset className="space-y-3">
                <legend className="text-sm font-medium text-stone-700">Instructor/es</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {[
                    { id: 'founder-rocio', nombre: 'Rocío', profesion: null },
                    { id: 'founder-lucia', nombre: 'Lucía', profesion: null },
                    ...instructors.filter((instructor) => !['rocío', 'lucía'].includes(instructor.nombre.trim().toLocaleLowerCase('es'))),
                  ].map((instructor) => {
                    const checked = fields.instructors.includes(instructor.nombre)
                    return <label key={instructor.id} className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${checked ? 'border-[#b7cbb3] bg-[#f3f7f1] text-[#45624c]' : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'}`}><input type="checkbox" name="instructors" value={instructor.nombre} checked={checked} onChange={() => toggleInstructor(instructor.nombre)} className="size-4 accent-[#54745c]" /><span className="min-w-0"><span className="block">{instructor.nombre}</span>{instructor.profesion && <span className="mt-0.5 block text-xs text-stone-500">{instructor.profesion}</span>}</span></label>
                  })}
                </div>
                {instructorsError && <p role="alert" className="text-sm text-rose-700">{instructorsError}</p>}
                <p className="text-xs text-stone-400">Puedes seleccionar una o ambas profesionales.</p>
                <Button type="button" variant="outline" onClick={() => { setInstructorSaveError(''); setIsInstructorDialogOpen(true) }} className="h-9 rounded-lg border-stone-300 text-sm text-stone-700">
                  + Agregar nuevo instructor
                </Button>
                <Dialog open={isInstructorDialogOpen} onOpenChange={(open) => { if (!isSavingInstructor) setIsInstructorDialogOpen(open) }}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Agregar nuevo instructor</DialogTitle>
                      <DialogDescription>Completa los datos y selecciona una foto para agregarlo al catálogo.</DialogDescription>
                    </DialogHeader>
                    <form id="add-instructor-form" onSubmit={handleAddInstructor} className="space-y-4">
                      <div className="space-y-2">
                        <label htmlFor="instructor-name" className="text-sm font-medium text-stone-700">Nombre</label>
                        <Input id="instructor-name" required value={instructorName} onChange={(event) => setInstructorName(event.target.value)} className="h-10 rounded-lg border-stone-300 bg-white" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="instructor-profession" className="text-sm font-medium text-stone-700">Profesión</label>
                        <Input id="instructor-profession" required value={instructorProfession} onChange={(event) => setInstructorProfession(event.target.value)} className="h-10 rounded-lg border-stone-300 bg-white" />
                      </div>
                      <div className="space-y-2">
                        <label htmlFor="instructor-photo" className="text-sm font-medium text-stone-700">Foto</label>
                        <input id="instructor-photo" type="file" accept="image/*" required onChange={(event) => setInstructorPhoto(event.target.files?.[0] ?? null)} className="block w-full text-sm text-stone-600 file:mr-3 file:rounded-md file:border-0 file:bg-stone-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-200" />
                      </div>
                      {instructorSaveError && <p role="alert" className="text-sm text-rose-700">{instructorSaveError}</p>}
                    </form>
                    <DialogFooter>
                      <Button type="button" variant="outline" disabled={isSavingInstructor} onClick={() => setIsInstructorDialogOpen(false)}>Cancelar</Button>
                      <Button type="submit" form="add-instructor-form" disabled={isSavingInstructor} className="bg-[#54745c] text-white hover:bg-[#45624c]">
                        {isSavingInstructor ? 'Guardando...' : 'Guardar instructor'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </fieldset>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border-stone-200 bg-white py-0 shadow-sm">
          <CardContent className="p-5 sm:p-7">
            <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
              <div><h2 className="text-lg font-semibold text-stone-800">Temario / Plan de Estudios</h2><p className="mt-1 text-sm text-stone-500">Organiza el curso en módulos y clases breves.</p></div>
              <span className="w-fit rounded-full bg-[#edf1e9] px-2.5 py-1 text-xs font-medium text-[#54745c]">{modules.length} {modules.length === 1 ? 'módulo' : 'módulos'} · {totalLessons} {totalLessons === 1 ? 'clase' : 'clases'}</span>
            </div>

            <div className="space-y-5">
              {modules.map((module, moduleIndex) => (
                <section key={module.id} className="rounded-xl border border-stone-200 bg-stone-50 p-4 sm:p-5" aria-label={`Módulo ${moduleIndex + 1}`}>
                  <div className="mb-4 flex items-start gap-3">
                    <span className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-semibold text-[#54745c] ring-1 ring-stone-200">{String(moduleIndex + 1).padStart(2, '0')}</span>
                    <div className="min-w-0 flex-1 space-y-2"><label htmlFor={`module-title-${module.id}`} className="text-sm font-medium text-stone-700">Título del Módulo</label><Input id={`module-title-${module.id}`} value={module.title} onChange={(event) => updateModuleTitle(module.id, event.target.value)} required placeholder={`Módulo ${moduleIndex + 1}: Título del módulo`} className="h-10 rounded-lg border-stone-300 bg-white px-3" /></div>
                    <Button type="button" onClick={() => removeModule(module.id)} variant="ghost" size="icon" disabled={modules.length === 1} className="mt-5 size-8 shrink-0 text-stone-400 hover:bg-rose-50 hover:text-rose-700" aria-label={`Eliminar módulo ${moduleIndex + 1}`} title="Eliminar módulo"><Trash2 /></Button>
                  </div>

                  <div className="space-y-3 rounded-lg border border-stone-200 bg-white p-3 sm:p-4">
                    <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-semibold text-stone-700">Clases del módulo</h3><span className="text-xs text-stone-400">{module.lessons.length} {module.lessons.length === 1 ? 'clase' : 'clases'}</span></div>
                    {module.lessons.map((lesson, lessonIndex) => (
                      <div key={lesson.id} className="rounded-lg border border-stone-100 bg-stone-50/70 p-3 sm:p-4">
                        <div className="mb-3 flex items-center justify-between gap-3"><p className="text-xs font-semibold uppercase tracking-wide text-stone-400">Clase {moduleIndex + 1}.{lessonIndex + 1}</p><Button type="button" onClick={() => removeLesson(module.id, lesson.id)} variant="ghost" size="icon" disabled={module.lessons.length === 1} className="size-7 text-stone-400 hover:bg-rose-50 hover:text-rose-700" aria-label={`Eliminar clase ${lessonIndex + 1}`} title="Eliminar clase"><Trash2 /></Button></div>
                        <div className="grid gap-4">
                          <div className="space-y-2"><label htmlFor={`lesson-title-${lesson.id}`} className="text-xs font-medium text-stone-600">Título de la clase</label><Input id={`lesson-title-${lesson.id}`} value={lesson.title} onChange={(event) => updateLesson(module.id, lesson.id, 'title', event.target.value)} required placeholder="Ej. Entendiendo el berrinche" className="h-10 rounded-lg border-stone-300 bg-white px-3" /></div>
                          <div className="space-y-2"><label htmlFor={`lesson-description-${lesson.id}`} className="text-xs font-medium text-stone-600">Descripción de la clase</label><Textarea id={`lesson-description-${lesson.id}`} value={lesson.description} onChange={(event) => updateLesson(module.id, lesson.id, 'description', event.target.value)} placeholder="Resume los temas y actividades de esta clase." className="min-h-20 resize-y rounded-lg border-stone-300 bg-white" /></div>
                          <div className="space-y-2"><label htmlFor={`lesson-video-${lesson.id}`} className="text-xs font-medium text-stone-600">URL del video</label><Input id={`lesson-video-${lesson.id}`} type="url" value={lesson.videoUrl} onChange={(event) => updateLesson(module.id, lesson.id, 'videoUrl', event.target.value)} placeholder="https://..." className="h-10 rounded-lg border-stone-300 bg-white px-3" /></div>
                        </div>
                      </div>
                    ))}
                    <Button type="button" onClick={() => addLesson(module.id)} variant="ghost" className="h-9 rounded-lg px-2.5 text-sm text-[#54745c] hover:bg-[#edf1e9] hover:text-[#45624c]"><CirclePlus data-icon="inline-start" /> Agregar Clase</Button>
                  </div>
                </section>
              ))}
            </div>

            <Button type="button" onClick={addModule} variant="ghost" className="mt-5 h-10 w-full rounded-lg border border-dashed border-stone-300 text-sm text-stone-600 hover:border-[#9aaf96] hover:bg-[#f6f8f5] hover:text-[#45624c]"><Plus data-icon="inline-start" /> Agregar Módulo</Button>
          </CardContent>
        </Card>

        <div className="flex flex-col-reverse gap-3 border-t border-stone-200 pt-5 sm:flex-row sm:justify-end">
          <Link href="/admin/cursos" className={buttonVariants({ variant: 'outline', className: 'h-10 rounded-lg border-stone-300 px-4' })}>Cancelar</Link>
          <Button type="submit" disabled={isSubmitting} className="h-10 rounded-lg bg-[#54745c] px-5 text-white shadow-sm hover:bg-[#45624c]">{isSubmitting ? 'Guardando...' : submitLabel}</Button>
        </div>
        {submitError && <p role="alert" className="text-sm text-rose-700">{submitError}</p>}
      </form>
    </section>
  )
}