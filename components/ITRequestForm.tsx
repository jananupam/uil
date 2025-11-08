import React, { useState } from 'react';
import type { ITRequest } from '../types';
import { MenuDotsIcon, CloseIcon } from './icons';

interface ITRequestFormProps {
  onSubmit: (request: Omit<ITRequest, 'id' | 'submittedAt' | 'status' | 'requesterId'>) => void;
}

const initialFormData = {
  firstName: '',
  lastName: '',
  department: '',
  email: '',
  contactNumber: '',
  problemCategories: [] as string[],
  otherCategoryDetail: '',
  details: '',
  comments: '',
  imageUrl: undefined as string | undefined,
};

type FormErrors = Partial<Record<keyof Omit<typeof initialFormData, 'problemCategories'>, string> & { problemCategories?: string }>;

const ITRequestForm: React.FC<ITRequestFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData(prev => {
      const newCategories = checked
        ? [...prev.problemCategories, value]
        : prev.problemCategories.filter(cat => cat !== value);
      return { ...prev, problemCategories: newCategories };
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
            const result = reader.result as string;
            setImagePreview(result);
            setFormData(prev => ({ ...prev, imageUrl: result }));
        };
        reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
      setImagePreview(null);
      setFormData(prev => ({ ...prev, imageUrl: undefined }));
      // Also reset the file input value
      const fileInput = document.getElementById('file-upload') as HTMLInputElement;
      if (fileInput) {
          fileInput.value = '';
      }
  };

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
        newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
    }
    if (!formData.contactNumber) {
        newErrors.contactNumber = 'Contact number is required';
    } else if (!/^\(?(\d{3})\)?[- ]?(\d{3})[- ]?(\d{4})$/.test(formData.contactNumber)) {
        newErrors.contactNumber = 'Please enter a valid phone number';
    }
    if (formData.problemCategories.length === 0) newErrors.problemCategories = 'At least one category must be selected';
    if (formData.problemCategories.includes('Other') && !formData.otherCategoryDetail) {
      newErrors.otherCategoryDetail = 'Please specify the problem';
    }
    if (!formData.details) newErrors.details = 'Details are required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
      setFormData(initialFormData);
      setImagePreview(null);
    }
  };

  const isOtherSelected = formData.problemCategories.includes('Other');

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
      <div 
        className="p-6 sm:p-8 border-b-4 border-sky-500 bg-slate-50 relative"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='64' height='64' viewBox='0 0 64 64' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23a7d5ed' stroke-opacity='0.2' stroke-width='1'%3E%3Cpath d='M0 8h8M16 8h8M32 8h8M48 8h8'/%3E%3Cpath d='M8 0v8M8 16v8M8 32v8M8 48v8'/%3E%3Cpath d='M0 24h8M16 24h8M32 24h8M48 24h8'/%3E%3Cpath d='M24 0v8M24 16v8M24 32v8M24 48v8'/%3E%3Cpath d='M0 40h8M16 40h8M32 40h8M48 40h8'/%3E%3Cpath d='M40 0v8M40 16v8M40 32v8M40 48v8'/%3E%3Cpath d='M0 56h8M16 56h8M32 56h8M48 56h8'/%3E%3Cpath d='M56 0v8M56 16v8M56 32v8M56 48v8'/%3E%3Ccircle cx='8' cy='8' r='2'/%3E%3Ccircle cx='24' cy='8' r='2'/%3E%3Ccircle cx='40' cy='8' r='2'/%3E%3Ccircle cx='56' cy='8' r='2'/%3E%3Ccircle cx='8' cy='24' r='2'/%3E%3Ccircle cx='24' cy='24' r='2'/%3E%3Ccircle cx='40' cy='24' r='2'/%3E%3Ccircle cx='56' cy='24' r='2'/%3E%3Ccircle cx='8' cy='40' r='2'/%3E%3Ccircle cx='24' cy='40' r='2'/%3E%3Ccircle cx='40' cy='40' r='2'/%3E%3Ccircle cx='56' cy='40' r='2'/%3E%3Ccircle cx='8' cy='56' r='2'/%3E%3Ccircle cx='24' cy='56' r='2'/%3E%3Ccircle cx='40' cy='56' r='2'/%3E%3Ccircle cx='56' cy='56' r='2'/%3E%3C/g%3E%3C/svg%3E")`,
        }}
        >
        <h1 className="text-3xl font-bold text-slate-800">IT Service Request Form</h1>
        <p className="mt-1 text-slate-600">Please fill out the form below to submit a ticket.</p>
        <button className="absolute top-4 right-4 text-slate-500 hover:text-slate-700">
          <MenuDotsIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6" noValidate>
        {/* Input fields for name, department, email etc. */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="firstName" className="block text-sm font-medium text-slate-700">First Name</label>
            <input type="text" name="firstName" id="firstName" value={formData.firstName} onChange={handleInputChange} className={`mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm ${errors.firstName ? 'border-red-500' : ''}`} />
            {errors.firstName && <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>}
          </div>
          <div>
            <label htmlFor="lastName" className="block text-sm font-medium text-slate-700">Last Name</label>
            <input type="text" name="lastName" id="lastName" value={formData.lastName} onChange={handleInputChange} className={`mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm ${errors.lastName ? 'border-red-500' : ''}`} />
            {errors.lastName && <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                <label htmlFor="department" className="block text-sm font-medium text-slate-700">Department</label>
                <input type="text" name="department" id="department" value={formData.department} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
            </div>
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700">E-mail</label>
                <input type="email" name="email" id="email" value={formData.email} onChange={handleInputChange} placeholder="ex: myname@example.com" className={`mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm ${errors.email ? 'border-red-500' : ''}`} />
                 {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
        </div>
        
        <div>
            <label htmlFor="contactNumber" className="block text-sm font-medium text-slate-700">Contact Number</label>
            <input 
                type="tel" 
                name="contactNumber" 
                id="contactNumber" 
                value={formData.contactNumber} 
                onChange={handleInputChange} 
                placeholder="e.g., 555-123-4567"
                className={`mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm ${errors.contactNumber ? 'border-red-500' : ''}`} 
            />
            {errors.contactNumber && <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>}
        </div>

        <div>
            <label className="block text-sm font-medium text-slate-700">Problem Category</label>
            <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 gap-4">
                {['Computer', 'Network', 'Other', 'Email', 'Phone'].map(category => (
                    <div key={category} className="flex items-center">
                        <input id={category} name="problemCategory" type="checkbox" value={category} checked={formData.problemCategories.includes(category)} onChange={handleCheckboxChange} className="h-4 w-4 rounded border-slate-300 text-sky-600 focus:ring-sky-500" />
                        <label htmlFor={category} className="ml-2 block text-sm text-slate-900">{category}</label>
                    </div>
                ))}
            </div>
            {errors.problemCategories && <p className="mt-1 text-sm text-red-600">{errors.problemCategories}</p>}
        </div>
        
        {isOtherSelected && (
            <div>
                <label htmlFor="otherCategoryDetail" className="block text-sm font-medium text-slate-700">Please Specify</label>
                <textarea id="otherCategoryDetail" name="otherCategoryDetail" rows={3} value={formData.otherCategoryDetail} onChange={handleInputChange} className={`mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm ${errors.otherCategoryDetail ? 'border-red-500' : ''}`}></textarea>
                {errors.otherCategoryDetail && <p className="mt-1 text-sm text-red-600">{errors.otherCategoryDetail}</p>}
            </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700">Attach an Image (Optional)</label>
          <div className="mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-md">
            <div className="space-y-1 text-center">
              <svg className="mx-auto h-12 w-12 text-slate-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <div className="flex text-sm text-slate-600">
                <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-sky-600 hover:text-sky-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-sky-500">
                  <span>Upload a file</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageChange} />
                </label>
                <p className="pl-1">or drag and drop</p>
              </div>
              <p className="text-xs text-slate-500">PNG, JPG, GIF</p>
            </div>
          </div>
          {imagePreview && (
            <div className="mt-4 relative w-48">
              <img src={imagePreview} alt="Selected preview" className="w-48 h-48 object-cover rounded-md shadow-lg" />
              <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 bg-white rounded-full p-1 text-slate-600 hover:text-red-600 shadow-md transition-colors" aria-label="Remove image">
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
        
        <div>
            <label htmlFor="details" className="block text-sm font-medium text-slate-700">Problem Details</label>
            <textarea id="details" name="details" rows={4} value={formData.details} onChange={handleInputChange} className={`mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm ${errors.details ? 'border-red-500' : ''}`}></textarea>
            {errors.details && <p className="mt-1 text-sm text-red-600">{errors.details}</p>}
        </div>

        <div>
            <label htmlFor="comments" className="block text-sm font-medium text-slate-700">Comments and Questions</label>
            <textarea id="comments" name="comments" rows={4} value={formData.comments} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm"></textarea>
        </div>

        <div className="flex justify-end pt-4">
            <button type="submit" className="inline-flex justify-center rounded-md border border-transparent bg-slate-800 py-2 px-6 text-sm font-medium text-white shadow-sm hover:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2">
                Submit
            </button>
        </div>
      </form>
    </div>
  );
};

export default ITRequestForm;