'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { BlockListEditor } from './block-list-editor'
import { useCreateTemplate, useUpdateTemplate } from '@/hooks/use-templates'
import { toast } from 'sonner'
import type { CardTemplate, TemplateBlock } from '@/types/card-template'

interface TemplateEditorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  template?: CardTemplate | null
}

export function TemplateEditorDialog({
  open,
  onOpenChange,
  template,
}: TemplateEditorDialogProps) {
  const t = useTranslations('template')
  const tCommon = useTranslations('common')

  const createTemplate = useCreateTemplate()
  const updateTemplate = useUpdateTemplate()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [frontBlocks, setFrontBlocks] = useState<TemplateBlock[]>([])
  const [backBlocks, setBackBlocks] = useState<TemplateBlock[]>([])
  const [ttsEnabled, setTtsEnabled] = useState(false)
  const [ttsLang, setTtsLang] = useState<'en' | 'zh-TW'>('en')

  useEffect(() => {
    if (template) {
      setName(template.name)
      setDescription(template.description ?? '')
      setFrontBlocks(template.frontBlocks)
      setBackBlocks(template.backBlocks)
      setTtsEnabled(template.tts?.enabled ?? false)
      setTtsLang(template.tts?.lang ?? 'en')
    } else {
      setName('')
      setDescription('')
      setFrontBlocks([
        { id: 'front-text-default', type: 'text', label: 'Front', required: true, markdown: true },
      ])
      setBackBlocks([
        { id: 'back-text-default', type: 'text', label: 'Back', required: true, markdown: true },
      ])
      setTtsEnabled(false)
      setTtsLang('en')
    }
  }, [template, open])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim()) return
    if (frontBlocks.length === 0) {
      toast.error(t('frontRequired'))
      return
    }

    const tts = ttsEnabled ? { enabled: true, lang: ttsLang } : null

    if (template) {
      updateTemplate.mutate(
        {
          id: template.id,
          name,
          description: description || null,
          frontBlocks,
          backBlocks,
          tts,
        },
        {
          onSuccess: () => {
            onOpenChange(false)
            toast.success(tCommon('success'))
          },
        }
      )
    } else {
      createTemplate.mutate(
        {
          name,
          description: description || null,
          frontBlocks,
          backBlocks,
          tts,
        },
        {
          onSuccess: () => {
            onOpenChange(false)
            toast.success(tCommon('success'))
          },
        }
      )
    }
  }

  const isLoading = createTemplate.isPending || updateTemplate.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {template ? t('editTemplate') : t('createTemplate')}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>{t('templateName')}</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t('templateName')}
              required
            />
          </div>

          <div className="space-y-2">
            <Label>{t('description')}</Label>
            <Input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('description')}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">{t('frontSide')}</Label>
            <BlockListEditor
              blocks={frontBlocks}
              onChange={setFrontBlocks}
              side="front"
            />
          </div>

          <div className="space-y-2">
            <Label className="text-base font-semibold">{t('backSide')}</Label>
            <BlockListEditor
              blocks={backBlocks}
              onChange={setBackBlocks}
              side="back"
            />
          </div>

          <div className="space-y-3 border-t pt-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={ttsEnabled}
                onCheckedChange={setTtsEnabled}
              />
              <Label>{t('ttsEnabled')}</Label>
            </div>
            {ttsEnabled && (
              <div className="space-y-1">
                <Label className="text-xs">{t('ttsLang')}</Label>
                <Select value={ttsLang} onValueChange={(v) => setTtsLang(v as 'en' | 'zh-TW')}>
                  <SelectTrigger className="h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">{t('english')}</SelectItem>
                    <SelectItem value="zh-TW">{t('chinese')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              {tCommon('cancel')}
            </Button>
            <Button type="submit" disabled={isLoading || !name.trim()}>
              {isLoading ? '...' : tCommon('save')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
