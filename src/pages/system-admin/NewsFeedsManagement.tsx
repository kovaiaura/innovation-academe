import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Send,
  Archive,
  Newspaper,
  FileText,
  Clock,
  CheckCircle,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { useNewsFeeds, useNewsFeedMutations, useRealtimeNewsFeeds } from "@/hooks/useNewsFeeds";
import { CreatePostDialog } from "@/components/news-feeds/CreatePostDialog";
import { PostViewDialog } from "@/components/news-feeds/PostViewDialog";
import { NewsFeedPost, PostStatus } from "@/services/newsFeed.service";

export default function NewsFeedsManagement() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editPost, setEditPost] = useState<NewsFeedPost | null>(null);
  const [viewPost, setViewPost] = useState<NewsFeedPost | null>(null);
  const [deletePost, setDeletePost] = useState<NewsFeedPost | null>(null);

  const { data: posts = [], isLoading, refetch } = useNewsFeeds({
    search: searchQuery || undefined,
  });

  const { deletePost: deletePostMutation, publishPost, archivePost } = useNewsFeedMutations();
  
  // Enable real-time updates
  useRealtimeNewsFeeds();

  // Filter posts based on active tab
  const filteredPosts = posts.filter((post) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'news') return post.type === 'news';
    if (activeTab === 'feed') return post.type === 'feed';
    if (activeTab === 'draft') return post.status === 'draft';
    if (activeTab === 'published') return post.status === 'published';
    if (activeTab === 'archived') return post.status === 'archived';
    return true;
  });

  // Statistics
  const stats = {
    total: posts.length,
    news: posts.filter(p => p.type === 'news').length,
    feeds: posts.filter(p => p.type === 'feed').length,
    published: posts.filter(p => p.status === 'published').length,
    drafts: posts.filter(p => p.status === 'draft').length,
    views: posts.reduce((acc, p) => acc + (p.views_count || 0), 0),
  };

  const handleEdit = (post: NewsFeedPost) => {
    setEditPost(post);
    setCreateDialogOpen(true);
  };

  const handleView = (post: NewsFeedPost) => {
    setViewPost(post);
    setViewDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deletePost) {
      await deletePostMutation.mutateAsync(deletePost.id);
      setDeletePost(null);
    }
  };

  const handlePublish = async (post: NewsFeedPost) => {
    await publishPost.mutateAsync(post.id);
  };

  const handleArchive = async (post: NewsFeedPost) => {
    await archivePost.mutateAsync(post.id);
  };

  const typeColors = {
    news: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
    feed: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
  };

  const statusColors = {
    draft: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300',
    published: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
    archived: 'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300',
  };

  const priorityColors = {
    low: 'bg-muted text-muted-foreground',
    medium: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
    high: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">News & Feeds</h1>
          <p className="text-muted-foreground">
            Create and manage announcements and updates for all users
          </p>
        </div>
        <Button onClick={() => { setEditPost(null); setCreateDialogOpen(true); }}>
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total Posts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Newspaper className="h-5 w-5 text-purple-700 dark:text-purple-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.news}</p>
                <p className="text-xs text-muted-foreground">News</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <Send className="h-5 w-5 text-green-700 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.feeds}</p>
                <p className="text-xs text-muted-foreground">Feeds</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-700 dark:text-green-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.published}</p>
                <p className="text-xs text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-700 dark:text-yellow-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.drafts}</p>
                <p className="text-xs text-muted-foreground">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Eye className="h-5 w-5 text-blue-700 dark:text-blue-300" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.views}</p>
                <p className="text-xs text-muted-foreground">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="news">News</TabsTrigger>
                <TabsTrigger value="feed">Feeds</TabsTrigger>
                <TabsTrigger value="draft">Drafts</TabsTrigger>
                <TabsTrigger value="published">Published</TabsTrigger>
                <TabsTrigger value="archived">Archived</TabsTrigger>
              </TabsList>
            </Tabs>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search posts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Button variant="outline" size="icon" onClick={() => refetch()}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-10">
              <Newspaper className="h-12 w-12 mx-auto text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">No posts found</p>
              <Button className="mt-4" onClick={() => { setEditPost(null); setCreateDialogOpen(true); }}>
                <Plus className="h-4 w-4 mr-2" />
                Create your first post
              </Button>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Post</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Target</TableHead>
                    <TableHead>Views</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {post.image_url && (
                            <img
                              src={post.image_url}
                              alt=""
                              className="h-10 w-10 rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="font-medium line-clamp-1">{post.title}</p>
                            <p className="text-xs text-muted-foreground line-clamp-1">
                              {post.content.slice(0, 50)}...
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={typeColors[post.type]}>
                          {post.type === 'news' ? '📰 News' : '📢 Feed'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[post.status]}>
                          {post.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[post.priority]}>
                          {post.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs">
                          {post.target_audience.join(', ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Eye className="h-4 w-4" />
                          {post.views_count || 0}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(post.created_at), { addSuffix: true })}
                        </span>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleView(post)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(post)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            {post.status === 'draft' && (
                              <DropdownMenuItem onClick={() => handlePublish(post)}>
                                <Send className="h-4 w-4 mr-2" />
                                Publish
                              </DropdownMenuItem>
                            )}
                            {post.status === 'published' && (
                              <DropdownMenuItem onClick={() => handleArchive(post)}>
                                <Archive className="h-4 w-4 mr-2" />
                                Archive
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeletePost(post)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <CreatePostDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open);
          if (!open) setEditPost(null);
        }}
        editPost={editPost}
      />

      {/* View Dialog */}
      <PostViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        post={viewPost}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletePost} onOpenChange={() => setDeletePost(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deletePost?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
