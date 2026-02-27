'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { newsService } from '@/features/news/services/news.service';
import { useNewsCategories } from '@/features/news/hooks';
import TiptapEditor from '@/common/components/ui/TextEditor';
import { useToast } from '@/common/providers/ToastProvider';
import { ArrowLeft, CircleX, Image as ImageIcon, Loader2, Save } from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import Cropper, { Area } from 'react-easy-crop'
import getCroppedImg from '@/lib/cropImage'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'
import { fi } from 'date-fns/locale';
import { ur } from 'zod/v4/locales';


export default function CreateNewsPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const isCreateMode = slug === 'create';
  const newsId = isCreateMode ? null : Number(slug);
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [editorReady, setEditorReady] = useState(false);

  // State quản lý form Tiếng Việt
  const [title_vn, setTitle] = useState('');
  const [content_vn, setContent] = useState('');
  const [summary_vn, setSummary] = useState('');

  // State quản lý form Tiếng Anh
  const [title_en, setTitleEn] = useState('');
  const [content_en, setContentEn] = useState('');
  const [summary_en, setSummaryEn] = useState('');

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const { showToast } = useToast();
  const { categories } = useNewsCategories();
  const [categoryId, setCategoryId] = useState<string>('');

  // States dùng cho luồng Crop tính năng
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null); // Lưu ảnh thô (Original URL) để cho vào Cropper
  const [cropPoint, setCropPoint] = useState({ x: 0, y: 0 }); // Toạ độ X,Y
  const [zoom, setZoom] = useState(1); // Zoom mặc định
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null); // Tọa độ để gửi cho file Utils Canvas

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

            // Lấy dữ liệu Tiếng Anh
            setTitleEn(news.title_en || '');
            setContentEn(news.content_en || '');
            setSummaryEn(news.summary_en || '');

            // Lấy thể loại
            if ((news as any).category_id) {
              setCategoryId(String((news as any).category_id));
            }

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
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setIsCropModalOpen(true); // Open Popup

        // Reset crop settings nếu chọn một ảnh mới
        setCropPoint({ x: 0, y: 0 });
        setZoom(1);
      }
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleApplyCrop = async () => {
    if (imageToCrop && croppedAreaPixels) {
      try {
        const { file, url } = await getCroppedImg(imageToCrop, croppedAreaPixels);

        setThumbnailFile(file);
        setThumbnailPreview(url);

        setIsCropModalOpen(false);
        setImageToCrop(null);
      } catch (e) {
        console.error('Lỗi khi crop ảnh', e);
      }
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

      // Thêm data tiếng Anh
      formData.append('title_en', title_en);
      formData.append('summary_en', summary_en);
      formData.append('content_en', content_en);

      // Thêm thể loại
      if (categoryId) {
        formData.append('category_id', categoryId);
      }

      if (isCreateMode) {
        // Mode tạo mới
        await newsService.createNews(formData);
        showToast('Tạo tin tức thành công!', 'success');
      } else {
        // Mode chỉnh sửa
        await newsService.updateNews(newsId!, formData as any);
        showToast('Cập nhật tin tức thành công!', 'success');
      }

      // Invalidate cache để trang list hiển thị dữ liệu mới
      await queryClient.invalidateQueries({ queryKey: ['news', 'getNews'] });

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
        {/* Tab Switch Language */}
        <Tabs defaultValue="vi" className="w-full">
          <div className="flex justify-end mb-4">
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="vi">VIE</TabsTrigger>
              <TabsTrigger value="en">ENG</TabsTrigger>
            </TabsList>
          </div>

          {/* Thumbnail */}
          <div className="space-y-1 mb-4">
            <Label>Ảnh đại diện (Thumbnail)</Label>
            <div className="relative group w-40 h-40 border-2 border-dashed border-input rounded-lg overflow-hidden flex items-center justify-center hover:border-primary transition">
              {thumbnailPreview ? (
                <>
                  <img src={thumbnailPreview} alt="Thumbnail preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                    <label className="text-white text-sm flex flex-col items-center cursor-pointer w-full h-full justify-center">
                      <ImageIcon size={24} className="mb-1" />
                      <span>Đổi ảnh</span>
                      <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                    </label>
                  </div>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-primary/5 hover:bg-primary/10 transition">
                  <ImageIcon size={32} className="text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Chọn ảnh</span>
                  <input type="file" accept="image/*" onChange={handleThumbnailChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Thể loại */}
          <div className="space-y-1 mb-4">
            <Label>Thể loại</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Chọn thể loại" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.name_vn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <TabsContent value="vi" className="space-y-6 mt-0">
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

            {/* Editor Content */}
            <div className="space-y-1">
              <Label>Nội dung bài viết</Label>
              <TiptapEditor
                content={content_vn}
                onChange={(html) => setContent(html)}
                onReady={handleEditorReady}
              />
            </div>
          </TabsContent>

          <TabsContent value='en' className='space-y-6 mt-0'>
            {/* Title (EN) */}
            <div className="space-y-1">
              <Label>Tiêu đề bài viết (EN)</Label>
              <Input
                type="text"
                value={title_en}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Nhập tiêu đề..."
              />
            </div>

            {/* Summary (EN) */}
            <div>
              <Label>Tóm tắt (EN)</Label>
              <Textarea
                value={summary_en}
                onChange={(e) => setSummaryEn(e.target.value)}
                placeholder="Nhập tóm tắt..."
              />
            </div>

            {/* Editor Content (EN) */}
            <div className="space-y-1">
              <Label>Nội dung bài viết (EN)</Label>
              <TiptapEditor
                content={content_en}
                onChange={(html) => setContentEn(html)}
                onReady={handleEditorReady}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            <CircleX size={20} />
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            disabled={loading}
          >
            {loading ? <Loader2 size={20} className="animate-spin" /> : <Save size={20} />}
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

      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cắt ảnh</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            {/* Vùng Cropper Canvas */}
            <div className="relative w-full h-[400px] bg-black/5 rounded-md overflow-hidden">
              {imageToCrop && (
                <Cropper
                  image={imageToCrop}
                  crop={cropPoint}
                  zoom={zoom}
                  aspect={1} // Ratio
                  onCropChange={setCropPoint}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>

            {/* Zoom Slider */}
            <div className="space-y-4">
              <Label>Phóng to / Thu nhỏ</Label>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.01}
                onValueChange={(vals) => setZoom(vals[0])}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCropModalOpen(false)}>Hủy</Button>
            <Button onClick={handleApplyCrop}>Xác nhận</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}