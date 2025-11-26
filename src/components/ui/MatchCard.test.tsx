import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MatchCard } from './MatchCard'

// Mock the hook
vi.mock('@/hooks/useMatchScore', () => ({
    useMatchScore: () => ({
        runs: 150,
        wickets: 4,
        overs: 15.2,
        balls: 2,
        status: 'live'
    })
}))

describe('MatchCard', () => {
    it('renders match title and opponent', () => {
        render(
            <MatchCard
                title="Koç vs ITU"
                date="2024-04-10T14:00:00Z"
                opponent="ITU"
                status="upcoming"
            />
        )
        expect(screen.getByText('Koç vs ITU')).toBeDefined()
        expect(screen.getByText('vs ITU')).toBeDefined()
    })

    it('displays live score when status is live', () => {
        render(
            <MatchCard
                title="Koç vs ITU"
                date="2024-04-10T14:00:00Z"
                status="live"
            />
        )
        expect(screen.getByText('LIVE SCORE')).toBeDefined()
        // Check if the mocked score is displayed
        expect(screen.getByText('150/4')).toBeDefined()
    })
})
