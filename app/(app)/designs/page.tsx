"use client"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, Search, Filter, Grid, List } from "lucide-react"
import { DesignGrid, DesignCardData } from "@/components/design/DesignGrid"
import { listDesigns, deleteDesign } from "@/lib/api/designs"
import { toast } from "sonner"

export default function DesignsPage() {
  const router = useRouter()
  const [designs, setDesigns] = useState<DesignCardData[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("updated_at")
  const [filterBy, setFilterBy] = useState("all")

  useEffect(() => {
    loadDesigns()
  }, [])

  const loadDesigns = async () => {
    try {
      setLoading(true)
      const data = await listDesigns()
      setDesigns(data)
    } catch (error) {
      console.error('Failed to load designs:', error)
      toast.error('Failed to load designs')
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (design: DesignCardData) => {
    router.push(`/studio?design=${design.id}`)
  }

  const handleDelete = async (design: DesignCardData) => {
    if (!confirm(`Are you sure you want to delete "${design.title}"?`)) {
      return
    }

    try {
      await deleteDesign(design.id)
      setDesigns(prev => prev.filter(d => d.id !== design.id))
      toast.success('Design deleted successfully')
    } catch (error) {
      console.error('Failed to delete design:', error)
      toast.error('Failed to delete design')
    }
  }

  const handleView = (design: DesignCardData) => {
    router.push(`/studio?design=${design.id}&mode=view`)
  }

  const filteredDesigns = designs
    .filter(design => {
      if (searchQuery) {
        return design.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
               design.garment_type.toLowerCase().includes(searchQuery.toLowerCase())
      }
      if (filterBy !== "all") {
        return design.garment_type === filterBy
      }
      return true
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "title":
          return a.title.localeCompare(b.title)
        case "created_at":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case "updated_at":
        default:
          return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
      }
    })

  const garmentTypes = [...new Set(designs.map(d => d.garment_type))]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">My Designs</h1>
          <p className="text-sm text-muted-foreground">
            Create, edit and export your designs.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push("/studio")}>
            <Plus className="h-4 w-4 mr-2" />
            New Design
          </Button>
          <Button variant="outline" onClick={loadDesigns}>
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search designs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <Select value={filterBy} onValueChange={setFilterBy}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {garmentTypes.map(type => (
              <SelectItem key={type} value={type}>
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="updated_at">Last Modified</SelectItem>
            <SelectItem value="created_at">Date Created</SelectItem>
            <SelectItem value="title">Name</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Design Grid */}
      <DesignGrid
        designs={filteredDesigns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onView={handleView}
        loading={loading}
        emptyState={
          <div className="text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Grid className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No designs yet</h3>
            <p className="text-muted-foreground mb-4">
              Start creating your first design to see it here.
            </p>
            <Button onClick={() => router.push("/studio")}>
              <Plus className="h-4 w-4 mr-2" />
              Create First Design
            </Button>
          </div>
        }
      />
    </div>
  )
}