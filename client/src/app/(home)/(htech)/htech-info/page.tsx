'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useCompanyInfo } from '@/features/company';
import { useToast } from '@/common/providers/ToastProvider';
import { ArrowLeft, CircleX, Image as ImageIcon, Loader2, Save } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import Cropper, { Area } from 'react-easy-crop';
import getCroppedImg from '@/lib/cropImage';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Slider } from '@/components/ui/slider';

export default function HtechInfoPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const {
    companyData,
    isLoading: dataLoading,
    createCompanyMutation,
    updateCompanyMutation,
    isCreating,
    isUpdating
  } = useCompanyInfo();

  const [name, setName] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [email, setEmail] = useState('');
  const [emailEn, setEmailEn] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneEn, setPhoneEn] = useState('');
  const [address, setAddress] = useState('');
  const [addressEn, setAddressEn] = useState('');

  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [isVideoPreview, setIsVideoPreview] = useState<boolean>(false);

  // Crop states
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [cropPoint, setCropPoint] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  useEffect(() => {
    if (companyData) {
      setName(companyData.name || '');
      setNameEn(companyData.name_en || '');
      setEmail(companyData.email || '');
      setEmailEn(companyData.email_en || '');
      setPhone(companyData.phone || '');
      setPhoneEn(companyData.phone_en || '');
      setAddress(companyData.address || '');
      setAddressEn(companyData.address_en || '');

      if (companyData.banner) {
        const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1').replace('/api/v1', '');
        setThumbnailPreview(`${baseUrl}${companyData.banner}`);
        setIsVideoPreview(/\.(mp4|webm|mov|quicktime)$/i.test(companyData.banner));
      }
    }
  }, [companyData]);

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      if (file.type.startsWith('video/')) {
        setThumbnailFile(file);
        setThumbnailPreview(URL.createObjectURL(file));
        setIsVideoPreview(true);
      } else if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImageToCrop(reader.result as string);
          setIsCropModalOpen(true);
          setCropPoint({ x: 0, y: 0 });
          setZoom(1);
        };
        reader.readAsDataURL(file);
      } else {
        showToast('Định dạng không hỗ trợ', 'error');
      }
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
        setIsVideoPreview(false);
        setIsCropModalOpen(false);
        setImageToCrop(null);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !phone || !address) {
      showToast('Vui lòng điền đầy đủ các thông tin bắt buộc!', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('name', name);
    formData.append('name_en', nameEn);
    formData.append('email', email);
    formData.append('email_en', emailEn);
    formData.append('phone', phone);
    formData.append('phone_en', phoneEn);
    formData.append('address', address);
    formData.append('address_en', addressEn);

    if (thumbnailFile) {
      formData.append('banner', thumbnailFile);
    }

    if (companyData && companyData.id) {
      updateCompanyMutation.mutate({ id: companyData.id, formData });
    } else {
      createCompanyMutation.mutate(formData);
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

  const isSaving = isCreating || isUpdating;

  return (
    <div className="container max-w-4xl mx-auto py-6">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">
          Thông tin công ty
        </h1>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-sm border">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-1 mb-6">
            <Label>Ảnh / Video Banner <span className="text-red-500">*</span></Label>
            <div className="relative group w-full h-48 md:h-64 border-2 border-dashed border-input rounded-lg overflow-hidden flex items-center justify-center hover:border-primary transition bg-muted/20">
              {thumbnailPreview ? (
                <>
                  {isVideoPreview ? (
                    <video src={thumbnailPreview} className="w-full h-full object-cover" autoPlay muted loop playsInline controls={false} />
                  ) : (
                    <img src={thumbnailPreview} alt="Banner preview" className="w-full h-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center cursor-pointer">
                    <label className="text-white text-sm flex flex-col items-center cursor-pointer w-full h-full justify-center">
                      <ImageIcon size={24} className="mb-1" />
                      <span>Đổi Banner</span>
                      <input type="file" accept="image/*,video/*" onChange={handleThumbnailChange} className="hidden" />
                    </label>
                  </div>
                </>
              ) : (
                <label className="w-full h-full flex flex-col items-center justify-center cursor-pointer bg-primary/5 hover:bg-primary/10 transition">
                  <ImageIcon size={32} className="text-muted-foreground mb-2" />
                  <span className="text-sm text-muted-foreground">Chọn ảnh (Tỉ lệ 16:9 khuyên dùng) HOẶC Video</span>
                  <input type="file" accept="image/*,video/*" onChange={handleThumbnailChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1">
              <Label>Tên công ty <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nhập tên công ty..."
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Tên công ty (English)</Label>
              <Input
                type="text"
                value={nameEn}
                onChange={(e) => setNameEn(e.target.value)}
                placeholder="Enter company name..."
              />
            </div>

            <div className="space-y-1">
              <Label>Email liên hệ <span className="text-red-500">*</span></Label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập địa chỉ email..."
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Email liên hệ (English)</Label>
              <Input
                type="email"
                value={emailEn}
                onChange={(e) => setEmailEn(e.target.value)}
                placeholder="Enter email address..."
              />
            </div>

            <div className="space-y-1">
              <Label>Số điện thoại <span className="text-red-500">*</span></Label>
              <Input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại..."
                required
              />
            </div>

            <div className="space-y-1">
              <Label>Số điện thoại (English)</Label>
              <Input
                type="text"
                value={phoneEn}
                onChange={(e) => setPhoneEn(e.target.value)}
                placeholder="Enter phone number..."
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>Địa chỉ <span className="text-red-500">*</span></Label>
              <Textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Nhập địa chỉ..."
                required
                rows={2}
              />
            </div>

            <div className="space-y-1 md:col-span-2">
              <Label>Địa chỉ (English)</Label>
              <Textarea
                value={addressEn}
                onChange={(e) => setAddressEn(e.target.value)}
                placeholder="Enter address..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t mt-8">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                if (companyData) {
                  setName(companyData.name || '');
                  setNameEn(companyData.name_en || '');
                  setEmail(companyData.email || '');
                  setEmailEn(companyData.email_en || '');
                  setPhone(companyData.phone || '');
                  setPhoneEn(companyData.phone_en || '');
                  setAddress(companyData.address || '');
                  setAddressEn(companyData.address_en || '');
                  if (companyData.banner) {
                    const baseUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5050/api/v1').replace('/api/v1', '');
                    setThumbnailPreview(`${baseUrl}${companyData.banner}`);
                    setIsVideoPreview(/\.(mp4|webm|mov|quicktime)$/i.test(companyData.banner));
                  }
                  setThumbnailFile(null);
                }
              }}
              disabled={isSaving}
            >
              <CircleX size={20} className="mr-2" />
              Khôi phục
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="min-w-[120px]"
            >
              {isSaving ? <Loader2 size={20} className="animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
              {isSaving ? 'Đang lưu...' : 'Lưu thông tin'}
            </Button>
          </div>
        </form>
      </div>

      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cắt ảnh Banner</DialogTitle>
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
  );
}