'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Plus, Pencil, Trash2, Lock } from 'lucide-react'
import { useTemplates, useDeleteTemplate } from '@/hooks/use-templates'
import { TemplateEditorDialog } from '@/components/templates/template-editor-dialog'
import { toast } from 'sonner'
import type { CardTemplate } from '@/types/card-template'

export default function TemplatesPage() {
  const t = useTranslations('template')
  const tCommon = useTranslations('common')
  const { data: templates, isLoading } = useTemplates()
  const deleteTemplate = useDeleteTemplate()

  const [editorOpen, setEditorOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<CardTemplate | null>(null)

  const handleCreate = () => {
    setEditingTemplate(null)
    setEditorOpen(true)
  }

  const handleEdit = (template: CardTemplate) => {
    setEditingTemplate(template)
    setEditorOpen(true)
  }

  const handleDelete = (template: CardTemplate) => {
    if (!confirm(t('confirmDelete'))) return
    deleteTemplate.mutate(template.id, {
      onSuccess: () => toast.success(tCommon('success')),
    })
  }

  const builtInTemplates = templates?.filter((t) => t.isBuiltIn) ?? []
  const customTemplates = templates?.filter((t) => !t.isBuiltIn) ?? []

  if (isLoading) {
    return (
      <div className="p-4 md:p-6 flex items-center justify-center min-h-[60vh]">
        <p className="text-muted-foreground">{tCommon('loading')}</p>
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          {t('createTemplate')}
        </Button>
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {t('builtIn')}
        </h2>
        {builtInTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            t={t}
          />
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
          {t('custom')}
        </h2>
        {customTemplates.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">
            {t('noCustom')}
          </p>
        ) : (
          customTemplates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              t={t}
              onEdit={() => handleEdit(template)}
              onDelete={() => handleDelete(template)}
            />
          ))
        )}
      </div>

      <TemplateEditorDialog
        open={editorOpen}
        onOpenChange={setEditorOpen}
        template={editingTemplate}
      />
    </div>
  )
}

function TemplateCard({
  template,
  t,
  onEdit,
  onDelete,
}: {
  template: CardTemplate
  t: ReturnType<typeof useTranslations>
  onEdit?: () => void
  onDelete?: () => void
}) {
  const frontCount = template.frontBlocks.length
  const backCount = template.backBlocks.length

  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{template.name}</span>
          {template.isBuiltIn && (
            <Badge variant="secondary" className="text-xs shrink-0">
              <Lock className="h-3 w-3 mr-1" />
              {t('builtIn')}
            </Badge>
          )}
        </div>
        {template.description && (
          <p className="text-sm text-muted-foreground truncate mt-0.5">
            {template.description}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {t('blockCount', { front: frontCount, back: backCount })}
        </p>
      </div>
      {!template.isBuiltIn && (
        <div className="flex gap-1 shrink-0">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
