import { z } from 'zod'

export const schema = z.object({
    name: z.string().min(1, { message: ' ' }),
    displayName: z.string().min(1, { message: ' ' }),
    description: z.string().optional(),
    discount: z.string().min(1, { message: ' ' }).refine((val) => !Number.isNaN(Number(val)) && Number(val) >= 0 && Number(val) <= 100, { message: ' ' }),
    active: z.boolean(),
})

export type FormFields = z.infer<typeof schema>
