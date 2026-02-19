import type { CardType } from '@/types/database'
import type { CardTemplate } from '@/types/card-template'

const BASIC_TEMPLATE: CardTemplate = {
  id: 'built-in-basic',
  name: 'Basic',
  description: 'Simple front/back flashcard',
  isBuiltIn: true,
  builtInType: 'basic',
  frontBlocks: [
    { id: 'front-text', type: 'text', label: 'Front', required: true, markdown: true },
  ],
  backBlocks: [
    { id: 'back-text', type: 'text', label: 'Back', required: true, markdown: true },
  ],
}

const CLOZE_TEMPLATE: CardTemplate = {
  id: 'built-in-cloze',
  name: 'Cloze',
  description: 'Fill-in-the-blank card with {{c1::answer}} syntax',
  isBuiltIn: true,
  builtInType: 'cloze',
  frontBlocks: [
    {
      id: 'cloze-text',
      type: 'text',
      label: 'Cloze Text',
      placeholder: 'Use {{c1::answer}} or {{c1::answer::hint}} syntax',
      required: true,
    },
  ],
  backBlocks: [],
}

const IMAGE_OCCLUSION_TEMPLATE: CardTemplate = {
  id: 'built-in-image-occlusion',
  name: 'Image Occlusion',
  description: 'Hide parts of an image to create flashcards',
  isBuiltIn: true,
  builtInType: 'image_occlusion',
  frontBlocks: [
    { id: 'occlusion-image', type: 'image', label: 'Image', required: true },
  ],
  backBlocks: [
    { id: 'occlusion-label', type: 'text', label: 'Label', required: true },
  ],
}

export const BUILT_IN_TEMPLATES: CardTemplate[] = [
  BASIC_TEMPLATE,
  CLOZE_TEMPLATE,
  IMAGE_OCCLUSION_TEMPLATE,
]

export function getBuiltInTemplate(cardType: CardType): CardTemplate | undefined {
  return BUILT_IN_TEMPLATES.find((t) => t.builtInType === cardType)
}

export function getBuiltInTemplateById(id: string): CardTemplate | undefined {
  return BUILT_IN_TEMPLATES.find((t) => t.id === id)
}

export function isBuiltInTemplateId(id: string): boolean {
  return id.startsWith('built-in-')
}
