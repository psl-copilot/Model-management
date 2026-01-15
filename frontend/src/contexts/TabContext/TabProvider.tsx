import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "react-router-dom"
import { Tabs } from "../../utils/Constants/data"
import { TabContext } from "./TabContext"

interface TabProviderProps {
    children: React.ReactNode
    mode?: string | null
}

export const TabProvider = ({ children, mode }: TabProviderProps) => {
    const [searchParams, setSearchParams] = useSearchParams()
    const tabFromUrl = searchParams.get('tab') ?? Tabs[0].value

    const [selectedTab, setSelectedTab] = useState<string>(tabFromUrl)
    const [enabledTabs, setEnabledTabs] = useState<string[]>([Tabs[0].value])


    const handleSetSelectedTab = useCallback((tab: string) => {
        setSelectedTab(tab)
        setSearchParams(prev => {
            const newParams = new URLSearchParams(prev)
            newParams.set('tab', tab)
            return newParams
        })
    }, [setSearchParams])

    const enableNextTab = useCallback(() => {
        const currentIndex = Tabs.findIndex(t => t.value === selectedTab)
        if (currentIndex >= 0 && currentIndex < Tabs.length - 1) {
            const nextTab = Tabs[currentIndex + 1]
            setEnabledTabs(prev => {
                if (!prev.includes(nextTab.value)) {
                    return [...prev, nextTab.value]
                }
                return prev
            })
            handleSetSelectedTab(nextTab.value)
        }
    }, [selectedTab, handleSetSelectedTab])

    const enableAllTabs = useCallback(() => {
        setEnabledTabs(Tabs.map(t => t.value))
    }, [])

    const tabsWithEnabled = Tabs.map(tab => ({
        ...tab,
        enabled: enabledTabs.includes(tab.value)
    }))

    return (
        <TabContext.Provider value={{
            selectedTab,
            enabledTabs,
            tabs: tabsWithEnabled,
            setSelectedTab: handleSetSelectedTab,
            enableNextTab,
            enableAllTabs
        }}>
            {children}
        </TabContext.Provider>
    )
}
