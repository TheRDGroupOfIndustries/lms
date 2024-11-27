"use client"

import React, { useState } from 'react';
import { Upload, Plus, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';
import { Navbar } from '@/components/Navbar';
import { Sidebar } from '@/components/InstructorSidebar';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

interface Material {
  title: string;
  file: File | null;
}

interface ExternalLink {
  title: string;
  url: string;
}

export default function CourseUploadPage() {
  const [uploadType, setUploadType] = useState<'url' | 'file'>('url');
  const [videoUrl, setVideoUrl] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnailUrl, setThumbnailUrl] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [materials, setMaterials] = useState<Material[]>([]);
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const [uploading, setUploading] = useState(false);

  const handleMaterialAdd = () => {
    setMaterials([...materials, { title: '', file: null }]);
  };

  const handleMaterialRemove = (index: number) => {
    const newMaterials = [...materials];
    newMaterials.splice(index, 1);
    setMaterials(newMaterials);
  };

  const handleMaterialChange = (index: number, field: keyof Material, value: string | File) => {
    const newMaterials = [...materials];
    if (field === 'file') {
      newMaterials[index][field] = value as File;
    } else {
      newMaterials[index][field] = value as string;
    }
    setMaterials(newMaterials);
  };

  const handleExternalLinkAdd = () => {
    setExternalLinks([...externalLinks, { title: '', url: '' }]);
  };

  const handleExternalLinkRemove = (index: number) => {
    const newLinks = [...externalLinks];
    newLinks.splice(index, 1);
    setExternalLinks(newLinks);
  };

  const handleExternalLinkChange = (index: number, field: keyof ExternalLink, value: string) => {
    const newLinks = [...externalLinks];
    newLinks[index][field] = value;
    setExternalLinks(newLinks);
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      setVideoUrl(''); // Clear URL when file is selected
    }
  };

  const handleThumbnailFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      setThumbnailUrl(''); // Clear URL when file is selected
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!isFormValid()) return;
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      formData.append('price', price);

      // Handle video upload based on type
      if (uploadType === 'url') {
        formData.append('videoUrl', videoUrl);
      } else if (videoFile) {
        formData.append('videoFile', videoFile);
      }

      // Handle thumbnail upload
      if (thumbnailFile) {
        formData.append('thumbnailFile', thumbnailFile);
      } else if (thumbnailUrl) {
        formData.append('thumbnailUrl', thumbnailUrl);
      }

      // Append materials
      materials.forEach((material) => {
        if (material.file) {
          formData.append(`file_${material.title}`, material.file);
        }
        formData.append('materials', JSON.stringify({
          title: material.title,
          type: 'FILE'
        }));
      });

      // Append external links
      externalLinks.forEach((link) => {
        formData.append('materials', JSON.stringify({
          title: link.title,
          type: 'LINK',
          content: link.url
        }));
      });

      const response = await fetch('/api/courses/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to upload course');
      }

      // Reset form and show success message
      resetForm();
      alert('Course uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Failed to upload course: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setUploading(false);
    }
  };

  const isFormValid = () => {
    if (uploadType === 'url' && !videoUrl) {
      alert('Please enter a video URL');
      return false;
    }
    if (uploadType === 'file' && !videoFile) {
      alert('Please select a video file');
      return false;
    }
    if (!title || !description || !price) {
      alert('Please fill in all required fields');
      return false;
    }
    return true;
  };

  const resetForm = () => {
    setVideoUrl('');
    setVideoFile(null);
    setThumbnailUrl('');
    setThumbnailFile(null);
    setTitle('');
    setDescription('');
    setPrice('');
    setMaterials([]);
    setExternalLinks([]);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Sidebar />

      <main className="pl-64 pt-16">
        <div className="max-w-4xl mx-auto p-8">
          <Card className="p-6 bg-white">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-xl font-semibold mb-2">Upload Video Courses</h2>
              <p className="text-gray-500">Create and publish your new video course</p>
              <p className="text-gray-400 text-sm">Supported formats: MP4, OGG</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Video Upload Method
                </label>
                <RadioGroup
                  value={uploadType}
                  onValueChange={(value) => setUploadType(value as 'url' | 'file')}
                  className="flex flex-col space-y-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="url" id="url" />
                    <Label htmlFor="url">Video URL (YouTube or Vimeo)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="file" id="file" />
                    <Label htmlFor="file">Upload Video File</Label>
                  </div>
                </RadioGroup>

                {uploadType === 'url' ? (
                  <Input
                    type="url"
                    placeholder="Enter Video URL"
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full"
                  />
                ) : (
                  <Input
                    type="file"
                    accept="video/*"
                    onChange={handleVideoFileChange}
                    className="w-full"
                  />
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-medium text-gray-700">
                  Course Thumbnail (Optional)
                </label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailFileChange}
                  className="w-full"
                />
                <p className="text-sm text-gray-500">Or provide a URL:</p>
                <Input
                  type="url"
                  placeholder="Enter Thumbnail URL (Optional)"
                  value={thumbnailUrl}
                  onChange={(e) => setThumbnailUrl(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Title
                </label>
                <Input
                  placeholder="Enter Course Title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Description
                </label>
                <Textarea
                  placeholder="Enter Course Description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[100px]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Downloadable Materials
                </label>
                <div className="space-y-3">
                  {materials.map((material, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Material Title"
                        value={material.title}
                        onChange={(e) => handleMaterialChange(index, 'title', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        type="file"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleMaterialChange(index, 'file', file);
                          }
                        }}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleMaterialRemove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleMaterialAdd}
                  className="mt-2 bg-[#17A34A] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Material
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  External Links
                </label>
                <div className="space-y-3">
                  {externalLinks.map((link, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        placeholder="Link Title"
                        value={link.title}
                        onChange={(e) => handleExternalLinkChange(index, 'title', e.target.value)}
                        className="flex-1"
                      />
                      <Input
                        placeholder="URL"
                        value={link.url}
                        onChange={(e) => handleExternalLinkChange(index, 'url', e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => handleExternalLinkRemove(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleExternalLinkAdd}
                  className="mt-2 bg-[#17A34A] text-white"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add External Link
                </Button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course Price
                </label>
                <Input
                  type="number"
                  placeholder="Enter Course Price"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex justify-center">
                <Button
                  type="submit"
                  className="w-full max-w-md bg-[#17A34A] text-white"
                  disabled={uploading}
                >
                  {uploading ? 'Uploading...' : 'Save and Upload'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}