'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { newsService } from '@/features/news/services/news.service';
import TiptapEditor from '@/common/components/ui/TextEditor';
import { useToast } from '@/common/providers/ToastProvider';
import { ArrowLeft, CircleX, Image as ImageIcon, Loader2, Save } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function CreateNewsPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const isCreateMode = slug === 'create';
  const newsId = isCreateMode ? null : Number(slug);

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [editorReady, setEditorReady] = useState(false);
  
  // State quản lý form
  const [title_vn, setTitle] = useState('');
  const [content_vn, setContent] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [summary_vn, setSummary] = useState('');
  const {showToast} = useToast();

  // Fetch dữ liệu bài viết nếu là edit mode, hoặc tắt loading nếu là create mode
  useEffect(() => {
    if (!isCreateMode && newsId) {
      const fetchNewsData = async () => {
        try {
          const response = await newsService.getNewsById(newsId);
          if (response.status === 'success' && response.data) {
            const news = response.data;
            setTitle(news.title_vn || '');
            setContent(news.content_vn || '');
            setSummary(news.summary_vn || '');
            
            // Kết hợp base URL với thumbnail_url
            if (news.thumbnail_url) {
              const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1').replace('/api/v1', '');
              const fullThumbnailUrl = `${baseUrl}${news.thumbnail_url}`;
              setThumbnailPreview(fullThumbnailUrl);
            }
          }
        } catch (error) {
          console.error('Error fetching news:', error);
          showToast('Không tìm thấy bài viết', 'error');
          router.push('/htech-news');
        } finally {
          setDataLoading(false);
        }
      };
      fetchNewsData();
    } else {
      // Create mode: tắt loading ngay
      setDataLoading(false);
    }
  }, [isCreateMode, newsId]);

  // Callback khi editor đã sẵn sàng
  const handleEditorReady = useCallback(() => {
    setEditorReady(true);
  }, []);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const thumbnail = e.target.files?.[0] || null;
    setThumbnailFile(thumbnail);
    
    if (thumbnail) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(thumbnail);
    } else {
      setThumbnailPreview(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title_vn || !content_vn) {
      showToast('Vui lòng nhập tiêu đề và nội dung!', 'error');
      return;
    }

    try {
      setLoading(true);

      // Tạo FormData
      const formData = new FormData();

      // Thêm thumbnail nếu có change
      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      // Thêm form fields
      formData.append('title_vn', title_vn);
      formData.append('summary_vn', summary_vn);
      formData.append('content_vn', content_vn);

      if (isCreateMode) {
        // Mode tạo mới
        await newsService.createNews(formData);
        showToast('Tạo tin tức thành công!', 'success');
      } else {
        // Mode chỉnh sửa
        await newsService.updateNews(newsId!, formData as any);
        showToast('Cập nhật tin tức thành công!', 'success');
      }

      router.push('/htech-news');
    } catch (error) {
      console.error(error);
      showToast(
        isCreateMode
          ? 'Có lỗi xảy ra khi tạo tin tức.'
          : 'Có lỗi xảy ra khi cập nhật tin tức.',
        'error'
      );
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-blue-600 mb-3" />
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <Button
        variant="ghost"
        className="flex items-center gap-2 text-muted-foreground hover:text-blue-600 mb-2"
        onClick={() => router.back()}
      >
        <ArrowLeft size={18} />
        <h1 className="text-lg font-bold text-gray-800">
           {isCreateMode ? 'Tạo Tin Tức Mới' : 'Chỉnh Sửa Tin Tức'}
        </h1>
      </Button>

      {/* Loading overlay khi editor chưa sẵn sàng */}
      {!editorReady && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
          <p className="text-sm text-muted-foreground">Đang khởi tạo trình soạn thảo...</p>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-6" style={{ display: editorReady ? 'block' : 'none' }}>
        {/* Tiêu đề */}
        <div className="space-y-1">
          <Label>Tiêu đề bài viết</Label>
          <Input
            type="text"
            value={title_vn}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Nhập tiêu đề..."
          />
        </div>

        {/* Tóm tắt */}
        <div className="space-y-1">
          <Label>Tóm tắt</Label>
          <Textarea
            value={summary_vn}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="Nhập tóm tắt..."
          />
        </div>

        {/* Thumbnail */}
        <div className="space-y-1">
          <Label>Ảnh đại diện (Thumbnail)</Label>
          <div className="flex flex-col gap-4 mt-2">
            <label className="flex items-center justify-center w-40 h-40 border-2 border-dashed border-input rounded-lg cursor-pointer hover:border-primary hover:bg-primary/5 transition">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
              />
              <div className="flex flex-col items-center gap-2">
                <ImageIcon size={32} className="text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Chọn ảnh</span>
              </div>
            </label>
            {thumbnailPreview && (
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-2">Preview:</p>
                <img
                  src={thumbnailPreview}
                  alt="Thumbnail preview"
                  className="max-w-xs h-auto border rounded shadow-md"
                />
              </div>
            )}
          </div>
        </div>

        {/* Editor Content */}
        <div className="space-y-1">
          <Label>Nội dung bài viết</Label>
          <TiptapEditor
            content={content_vn}
            onChange={(html) => setContent(html)}
            onReady={handleEditorReady}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            <CircleX size={20}/>
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20}/>}
            {loading
              ? isCreateMode
                ? 'Đang tạo...'
                : 'Đang cập nhật...'
              : isCreateMode
              ? 'Đăng tin'
              : 'Cập nhật'}
          </Button>
        </div>
      </form>
    </div>
  )
}