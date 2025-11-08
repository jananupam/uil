
import React, { useState } from 'react';
import type { ITRequest } from '../types';
import { MenuDotsIcon } from './icons';

interface ITRequestFormProps {
  onSubmit: (request: Omit<ITRequest, 'id' | 'submittedAt' | 'status'>) => void;
}

const initialFormData = {
  firstName: '',
  lastName: '',
  department: '',
  email: '',
  buildingNumber: '',
  problemCategories: [],
  otherCategoryDetail: '',
  details: '',
  comments: '',
};

// Fix: Define a specific type for form errors. The original type `Partial<typeof initialFormData>` was incorrect because `problemCategories` was expected to be an array, but the error message is a string. This new type maps all form field keys to an optional string.
type FormErrors = Partial<Record<keyof typeof initialFormData, string>>;

const ITRequestForm: React.FC<ITRequestFormProps> = ({ onSubmit }) => {
  const [formData, setFormData] = useState<Omit<ITRequest, 'id' | 'submittedAt' | 'status'>>(initialFormData);
  const [errors, setErrors] = useState<FormErrors>({});

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

  const validate = () => {
    const newErrors: FormErrors = {};
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    if (!formData.email) {
        newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid';
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
    }
  };

  const isOtherSelected = formData.problemCategories.includes('Other');

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-xl overflow-hidden">
      <div 
        className="p-6 sm:p-8 border-b-4 border-sky-500 bg-slate-50 relative"
        style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill-rule='evenodd'%3E%3Cg fill='%23a7d5ed' fill-opacity='0.2'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
        >
        <h1 className="text-3xl font-bold text-slate-800">IT Service Request Form</h1>
        <p className="mt-1 text-slate-600">Please fill out the form below to submit a ticket.</p>
        <button className="absolute top-4 right-4 text-slate-500 hover:text-slate-700">
          <MenuDotsIcon className="w-6 h-6" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6" noValidate>
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
            <label htmlFor="buildingNumber" className="block text-sm font-medium text-slate-700">Building Number</label>
            <input type="text" name="buildingNumber" id="buildingNumber" value={formData.buildingNumber} onChange={handleInputChange} className="mt-1 block w-full rounded-md border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 sm:text-sm" />
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
