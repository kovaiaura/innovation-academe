import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Search, Newspaper, Rss, RefreshCw, Loader2 } from "lucide-react";
import { usePublishedNewsFeeds, useRealtimeNewsFeeds } from "@/hooks/useNewsFeeds";
import { PostCard } from "@/components/news-feeds/PostCard";
import { PostType } from "@/services/newsFeed.service";

export default function NewsFeedsPage() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const { data: posts = [], isLoading, refetch } = usePublishedNewsFeeds({
    search: searchQuery || undefined,
  });

  // Enable real-time updates
  useRealtimeNewsFeeds();

  // Filter posts based on active tab
  const filteredPosts = posts.filter((post) => {
    if (activeTab === 'all') return true;
    return post.type === activeTab;
  });

  // Separate high priority posts
  const highPriorityPosts = filteredPosts.filter(p => p.priority === 'high');
  const regularPosts = filteredPosts.filter(p => p.priority !== 'high');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">News & Feeds</h1>
          <p className="text-muted-foreground">
            Stay updated with the latest announcements and activities
          </p>
        </div>
        <Button variant="outline" size="icon" onClick={() => refetch()}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList>
            <TabsTrigger value="all" className="gap-2">
              <Rss className="h-4 w-4" />
              All
            </TabsTrigger>
            <TabsTrigger value="news" className="gap-2">
              <Newspaper className="h-4 w-4" />
              News
            </TabsTrigger>
            <TabsTrigger value="feed" className="gap-2">
              📢 Feeds
            </TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredPosts.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Newspaper className="h-16 w-16 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No posts yet</h3>
            <p className="text-muted-foreground">
              Check back later for updates and announcements
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* High Priority Section */}
          {highPriorityPosts.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-lg font-semibold text-destructive flex items-center gap-2">
                🔥 Important Updates
              </h2>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {highPriorityPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}

          {/* Regular Posts */}
          {regularPosts.length > 0 && (
            <div className="space-y-4">
              {highPriorityPosts.length > 0 && (
                <h2 className="text-lg font-semibold">Latest Updates</h2>
              )}
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {regularPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
