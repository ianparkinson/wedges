import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { Link } from './Link'

describe('Link', () => {
  it('opens external links in a new tab', () => {
    render(<Link href="https://oracc.museum.upenn.edu/osl/">OSL</Link>)
    const link = screen.getByRole('link', { name: 'OSL' })
    expect(link).toHaveAttribute('target', '_blank')
    expect(link).toHaveAttribute('rel', 'noopener noreferrer')
  })

  it('keeps relative links in the same tab', () => {
    render(<Link href="#help">Help</Link>)
    expect(screen.getByRole('link', { name: 'Help' })).not.toHaveAttribute(
      'target',
    )
  })
})
