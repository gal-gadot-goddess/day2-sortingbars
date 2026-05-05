
export interface Theme {
    id: string;
    name: string;
    compare: string;
    swap: string;
    sorted: string;
    compareShadow: string;
    swapShadow: string;
    sortedShadow: string;
}

export const THEMES: Record<string, Theme> = {
    vampire: {
        id: 'vampire',
        name: 'Vampire Aura',
        compare: 'bg-rose-500',
        swap: 'bg-blue-400',
        sorted: 'bg-[#b3ff1a]',
        compareShadow: '0 0 60px rgba(244,63,94,0.8)',
        swapShadow: '0 0 80px rgba(96,165,250,1)',
        sortedShadow: '0 0 70px rgba(179,255,26,0.8)',
    },
    cyberpunk: {
        id: 'cyberpunk',
        name: 'Cyberpunk 2077',
        compare: 'bg-[#fcee0a]',
        swap: 'bg-[#00f0ff]',
        sorted: 'bg-[#ff003c]',
        compareShadow: '0 0 50px rgba(252,238,10,0.7)',
        swapShadow: '0 0 70px rgba(0,240,255,0.8)',
        sortedShadow: '0 0 60px rgba(255,0,60,0.7)',
    },
    sunset: {
        id: 'sunset',
        name: 'Sunset Glow',
        compare: 'bg-[#ff4e50]',
        swap: 'bg-[#f9d423]',
        sorted: 'bg-[#43cea2]',
        compareShadow: '0 0 50px rgba(255,78,80,0.7)',
        swapShadow: '0 0 70px rgba(249,212,35,0.8)',
        sortedShadow: '0 0 60px rgba(67,206,162,0.7)',
    },
    frost: {
        id: 'frost',
        name: 'Nordic Frost',
        compare: 'bg-[#81d4fa]',
        swap: 'bg-[#b2ebf2]',
        sorted: 'bg-[#e1f5fe]',
        compareShadow: '0 0 50px rgba(129,212,250,0.7)',
        swapShadow: '0 0 70px rgba(178,235,242,0.8)',
        sortedShadow: '0 0 60px rgba(225,245,254,0.7)',
    }
};
