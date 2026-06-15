import { NextRequest, NextResponse } from 'next/server'
import { z, ZodType } from 'zod'

/**
 * Validates request body against a Zod schema.
 * Returns { data, error } — data is the parsed body if valid, error is a response if invalid.
 */
export function validateBody<T>(
  schema: ZodType<T>,
  body: unknown
): { data: T; error: null } | { data: null; error: NextResponse } {
  const result = schema.safeParse(body)

  if (!result.success) {
    const errors = result.error.issues.map((issue) => ({
      field: String(issue.path.join('.')),
      message: issue.message,
    }))

    return {
      data: null,
      error: NextResponse.json(
        {
          success: false,
          error: 'Validation failed',
          details: errors,
        },
        { status: 400 }
      ),
    }
  }

  return { data: result.data, error: null }
}

/**
 * Validates URL query params against a Zod schema.
 * Returns { data, error } — data is the parsed query if valid, error is a response if invalid.
 */
export function validateQuery<T>(
  schema: ZodType<T>,
  url: string
): { data: T; error: null } | { data: null; error: NextResponse } {
  try {
    const { searchParams } = new URL(url)
    const params: Record<string, string> = {}
    searchParams.forEach((value, key) => {
      params[key] = value
    })

    const result = schema.safeParse(params)

    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: String(issue.path.join('.')),
        message: issue.message,
      }))

      return {
        data: null,
        error: NextResponse.json(
          {
            success: false,
            error: 'Validation failed',
            details: errors,
          },
          { status: 400 }
        ),
      }
    }

    return { data: result.data, error: null }
  } catch {
    return {
      data: null,
      error: NextResponse.json(
        {
          success: false,
          error: 'Invalid URL',
        },
        { status: 400 }
      ),
    }
  }
}

/**
 * Higher-order function that wraps a route handler with body validation.
 *
 * Usage:
 *   export async function POST(request: NextRequest) {
 *     return withValidation(createProjectSchema, request, async (data) => {
 *       const project = await db.project.create({ data })
 *       return NextResponse.json({ success: true, data: project })
 *     })
 *   }
 */
export async function withValidation<T>(
  schema: ZodType<T>,
  request: NextRequest,
  handler: (data: T, request: NextRequest) => Promise<NextResponse>
): Promise<NextResponse> {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json(
      {
        success: false,
        error: 'Invalid JSON body',
      },
      { status: 400 }
    )
  }

  const { data, error } = validateBody(schema, body)

  if (error) {
    return error
  }

  return handler(data, request)
}

// ---------------------------------------------------------------------------
// Common validation schemas for reuse across routes
// ---------------------------------------------------------------------------

export const commonSchemas = {
  pagination: z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
  }),

  search: z.object({
    search: z.string().optional(),
    status: z.string().optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),

  idParam: z.object({
    id: z.string().min(1),
  }),

  email: z.string().email('Invalid email address'),

  phone: z
    .string()
    .min(6, 'Phone number too short')
    .max(20, 'Phone number too long'),

  requiredString: (field: string) =>
    z.string().min(1, `${field} is required`).max(500),

  optionalString: (field: string) => z.string().max(500).optional(),

  dateRange: z.object({
    startDate: z.string().optional(),
    endDate: z.string().optional(),
  }),
}