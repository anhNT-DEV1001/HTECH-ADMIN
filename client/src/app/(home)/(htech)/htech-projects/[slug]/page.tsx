'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/features/project/services/project.service';
import { useProjectCategories } from '@/features/project/hooks';
import { ProjectStatus } from '@/features/project/interfaces';
import TiptapEditor from '@/common/components/ui/TextEditor';
import { useToast } from '@/common/providers/ToastProvider';
import { ArrowLeft, CalendarIcon, CircleX, Image as ImageIcon, Loader2, Save } from 'lucide-react';
import dayjs from 'dayjs';

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";

import Cropper, { Area } from 'react-easy-crop'
import getCroppedImg from '@/lib/cropImage'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Slider } from '@/components/ui/slider'

const STATUS_OPTIONS: { value: ProjectStatus; label: string }[] = [
  { value: 'UPCOMING', label: 'Sắp diễn ra' },
  { value: 'ONGOING', label: 'Đang thực hiện' },
  { value: 'COMPLETED', label: 'Hoàn thành' },
  { value: 'CANCELLED', label: 'Đã huỷ' },
];

export default function CreateProjectPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const isCreateMode = slug === 'create';
  const projectId = isCreateMode ? null : Number(slug);
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [editorReady, setEditorReady] = useState(false);

  // State quản lý form Tiếng Việt
  const [title_vn, setTitle] = useState('');
  const [description_vn, setDescription] = useState('');
  const [summary_vn, setSummary] = useState('');

  // State quản lý form Tiếng Anh
  const [title_en, setTitleEn] = useState('');
  const [description_en, setDescriptionEn] = useState('');
  const [summary_en, setSummaryEn] = useState('');

  // State quản lý thông tin dự án
  const [client_name, setClientName] = useState('');
  const [venue_vn, setVenueVn] = useState('');
  const [venue_en, setVenueEn] = useState('');
  const [location_url, setLocationUrl] = useState('');
  const [scale, setScale] = useState('');
  const [industry_vn, setIndustryVn] = useState('');
  const [industry_en, setIndustryEn] = useState('');
  const [status, setStatus] = useState<ProjectStatus>('UPCOMING');
  const [is_featured, setIsFeatured] = useState(false);
  const [sort_order, setSortOrder] = useState(0);

  // State quản lý ngày
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
  const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const { showToast } = useToast();
  const { categories } = useProjectCategories();
  const [categoryId, setCategoryId] = useState<string>('');

  // States dùng cho luồng Crop ảnh
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropPoint, setCropPoint] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  // Fetch dữ liệu dự án nếu là edit mode
  useEffect(() => {
    if (!isCreateMode && projectId) {
      const fetchProjectData = async () => {
        try {
          const response = await projectService.getProjectById(projectId);
          if (response.status === 'success' && response.data) {
            const project = response.data;
            setTitle(project.title_vn || '');
            setDescription(project.description_vn || '');
            setSummary(project.summary_vn || '');

            setTitleEn(project.title_en || '');
            setDescriptionEn(project.description_en || '');
            setSummaryEn(project.summary_en || '');

            setClientName(project.client_name || '');
            setVenueVn(project.venue_vn || '');
            setVenueEn(project.venue_en || '');
            setLocationUrl(project.location_url || '');
            setScale(project.scale || '');
            setIndustryVn(project.industry_vn || '');
            setIndustryEn(project.industry_en || '');
            setStatus(project.status || 'UPCOMING');
            setIsFeatured(project.is_featured || false);
            setSortOrder(project.sort_order || 0);

            if (project.start_date) setStartDate(new Date(project.start_date));
            if (project.end_date) setEndDate(new Date(project.end_date));

            if (project.category_id) {
              setCategoryId(String(project.category_id));
            }

            if (project.thumbnail_url) {
              const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1').replace('/api/v1', '');
              const fullThumbnailUrl = `${baseUrl}${project.thumbnail_url}`;
              setThumbnailPreview(fullThumbnailUrl);
            }
          }
        } catch (error) {
          console.error('Error fetching project:', error);
          showToast('Không tìm thấy dự án', 'error');
          router.push('/htech-projects');
        } finally {
          setDataLoading(false);
        }
      };
      fetchProjectData();
    } else {
      setDataLoading(false);
    }
  }, [isCreateMode, projectId]);

  const handleEditorReady = useCallback(() => {
    setEditorReady(true);
  }, []);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageToCrop(reader.result as string);
        setIsCropModalOpen(true);
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
    if (!title_vn || !description_vn) {
      showToast('Vui lòng nhập tiêu đề và nội dung mô tả!', 'error');
      return;
    }

    try {
      setLoading(true);

      const formData = new FormData();

      if (thumbnailFile) {
        formData.append('thumbnail', thumbnailFile);
      }

      // Thông tin Tiếng Việt
      formData.append('title_vn', title_vn);
      formData.append('summary_vn', summary_vn);
      formData.append('description_vn', description_vn);

      // Thông tin Tiếng Anh
      formData.append('title_en', title_en);
      formData.append('summary_en', summary_en);
      formData.append('description_en', description_en);

      // Thông tin dự án
      formData.append('client_name', client_name);
      formData.append('venue_vn', venue_vn);
      formData.append('venue_en', venue_en);
      formData.append('location_url', location_url);
      formData.append('scale', scale);
      formData.append('industry_vn', industry_vn);
      formData.append('industry_en', industry_en);
      formData.append('status', status);
      formData.append('is_featured', String(is_featured));
      formData.append('sort_order', String(sort_order));

      if (startDate) {
        formData.append('start_date', dayjs(startDate).format('YYYY-MM-DD'));
      }
      if (endDate) {
        formData.append('end_date', dayjs(endDate).format('YYYY-MM-DD'));
      }

      if (categoryId) {
        formData.append('category_id', categoryId);
      }

      if (isCreateMode) {
        await projectService.createProject(formData);
        showToast('Tạo dự án thành công!', 'success');
      } else {
        await projectService.updateProject(projectId!, formData);
        showToast('Cập nhật dự án thành công!', 'success');
      }

      await queryClient.invalidateQueries({ queryKey: ['project', 'getProject'] });
      router.push('/htech-projects');
    } catch (error) {
      console.error(error);
      showToast(
        isCreateMode
          ? 'Có lỗi xảy ra khi tạo dự án.'
          : 'Có lỗi xảy ra khi cập nhật dự án.',
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
          {isCreateMode ? 'Tạo Dự Án Mới' : 'Chỉnh Sửa Dự Án'}
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

          {/* Thể loại & Trạng thái */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="space-y-1">
              <Label>Thể loại</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger className="w-full">
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

            <div className="space-y-1">
              <Label>Trạng thái</Label>
              <Select value={status} onValueChange={(val) => setStatus(val as ProjectStatus)}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label>Khách hàng</Label>
              <Input
                type="text"
                value={client_name}
                onChange={(e) => setClientName(e.target.value)}
                placeholder="Tên khách hàng..."
              />
            </div>
          </div>

          {/* Ngày bắt đầu & Kết thúc */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <Label>Ngày bắt đầu</Label>
              <Popover open={startDatePopoverOpen} onOpenChange={setStartDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? dayjs(startDate).format("DD/MM/YYYY") : "Chọn ngày bắt đầu"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => {
                      setStartDate(date);
                      setStartDatePopoverOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-1">
              <Label>Ngày kết thúc</Label>
              <Popover open={endDatePopoverOpen} onOpenChange={setEndDatePopoverOpen}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? dayjs(endDate).format("DD/MM/YYYY") : "Chọn ngày kết thúc"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => {
                      setEndDate(date);
                      setEndDatePopoverOpen(false);
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Thông tin bổ sung: Quy mô, Ngành, Thứ tự, Nổi bật */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <div className="space-y-1">
              <Label>Quy mô</Label>
              <Input
                type="text"
                value={scale}
                onChange={(e) => setScale(e.target.value)}
                placeholder="VD: 500 người..."
              />
            </div>

            <div className="space-y-1">
              <Label>Thứ tự hiển thị</Label>
              <Input
                type="number"
                value={sort_order}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                placeholder="0"
              />
            </div>

            <div className="space-y-1">
              <Label>Location URL</Label>
              <Input
                type="text"
                value={location_url}
                onChange={(e) => setLocationUrl(e.target.value)}
                placeholder="Link Google Maps..."
              />
            </div>

            <div className="flex items-center gap-3 pt-6">
              <Checkbox
                checked={is_featured}
                onCheckedChange={(checked) => setIsFeatured(checked === true)}
              />
              <Label>Dự án nổi bật</Label>
            </div>
          </div>

          {/* ===== TAB TIẾNG VIỆT ===== */}
          <TabsContent value="vi" className="space-y-6 mt-0">
            <div className="space-y-1">
              <Label>Tiêu đề dự án</Label>
              <Input
                type="text"
                value={title_vn}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề..."
              />
            </div>

            <div className="space-y-1">
              <Label>Tóm tắt</Label>
              <Textarea
                value={summary_vn}
                onChange={(e) => setSummary(e.target.value)}
                placeholder="Nhập tóm tắt..."
              />
            </div>

            {/* Địa điểm & Ngành nghề (VN) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Địa điểm</Label>
                <Input
                  type="text"
                  value={venue_vn}
                  onChange={(e) => setVenueVn(e.target.value)}
                  placeholder="Nhập địa điểm..."
                />
              </div>
              <div className="space-y-1">
                <Label>Ngành nghề</Label>
                <Input
                  type="text"
                  value={industry_vn}
                  onChange={(e) => setIndustryVn(e.target.value)}
                  placeholder="Nhập ngành nghề..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Mô tả chi tiết dự án</Label>
              <TiptapEditor
                content={description_vn}
                onChange={(html) => setDescription(html)}
                onReady={handleEditorReady}
              />
            </div>
          </TabsContent>

          {/* ===== TAB TIẾNG ANH ===== */}
          <TabsContent value='en' className='space-y-6 mt-0'>
            <div className="space-y-1">
              <Label>Tiêu đề dự án (EN)</Label>
              <Input
                type="text"
                value={title_en}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="Enter title..."
              />
            </div>

            <div className="space-y-1">
              <Label>Tóm tắt (EN)</Label>
              <Textarea
                value={summary_en}
                onChange={(e) => setSummaryEn(e.target.value)}
                placeholder="Enter summary..."
              />
            </div>

            {/* Địa điểm & Ngành nghề (EN) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Venue (EN)</Label>
                <Input
                  type="text"
                  value={venue_en}
                  onChange={(e) => setVenueEn(e.target.value)}
                  placeholder="Enter venue..."
                />
              </div>
              <div className="space-y-1">
                <Label>Industry (EN)</Label>
                <Input
                  type="text"
                  value={industry_en}
                  onChange={(e) => setIndustryEn(e.target.value)}
                  placeholder="Enter industry..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label>Mô tả chi tiết dự án (EN)</Label>
              <TiptapEditor
                content={description_en}
                onChange={(html) => setDescriptionEn(html)}
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
                ? 'Tạo dự án'
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
            <div className="relative w-full h-[400px] bg-black/5 rounded-md overflow-hidden">
              {imageToCrop && (
                <Cropper
                  image={imageToCrop}
                  crop={cropPoint}
                  zoom={zoom}
                  aspect={16 / 9}
                  onCropChange={setCropPoint}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>

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
