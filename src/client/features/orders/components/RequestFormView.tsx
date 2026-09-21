import { AnimatePresence } from 'motion/react';
import { CakeGalleryItem, User } from '@shared/types';
import { t } from '@client/i18n/index';
import { usePageTitle } from '../../core/hooks/usePageTitle';
import OrderTrackingView from './OrderTrackingView';
import RequestSuccessView from './RequestSuccessView';
import RequestSidebar from './RequestSidebar';
import RequestFormFields from './RequestFormFields';
import { useRequestForm } from '../hooks/useRequestForm';

interface RequestFormViewProps {
  readonly prefilledCake: CakeGalleryItem | null;
  readonly onClearPrefilledCake: () => void;
  readonly currentUser?: User | null;
}

export default function RequestFormView({
  prefilledCake,
  onClearPrefilledCake,
  currentUser
}: Readonly<RequestFormViewProps>) {
  usePageTitle("Request a Cake");
  const form = useRequestForm(prefilledCake, onClearPrefilledCake, currentUser);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-20">
      <section className="text-center max-w-xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-serif text-warm-950 dark:text-stone-100 mb-3">{t('order.createTitle')}</h1>
        <p className="text-sm text-stone-600 dark:text-stone-300 font-light leading-relaxed font-sans">
          Tell us about your celebration. Yodit will reach out to discuss flavours, design, and all the details.
        </p>
        <div className="h-[1px] w-24 bg-stone-300 mx-auto mt-6" />
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start text-left">
        <div className="lg:col-span-7 bg-white dark:bg-stone-950 p-6 sm:p-10 border border-stone-200/60 dark:border-stone-850 rounded-sm shadow-xs">
          <AnimatePresence mode="wait">
            {form.formSubmitted ? (
              <RequestSuccessView
                submittedId={form.submittedId}
                onReset={form.resetForm}
              />
            ) : (
              <RequestFormFields
                form={form.form}
                prefilledCake={prefilledCake}
                valError={form.valError}
                dateError={form.dateError}
                uploading={form.uploading}
                uploadedImageUrl={form.uploadedImageUrl}
                uploadError={form.uploadError}
                isDragging={form.isDragging}
                submitting={form.submitting}
                getMinDateString={form.getMinDateString}
                onInputChange={form.handleInputChange}
                onFileChange={form.handleFileChange}
                onDragOver={form.handleDragOver}
                onDragEnter={form.handleDragEnter}
                onDragLeave={form.handleDragLeave}
                onDrop={form.handleDrop}
                onClearPrefilledCake={onClearPrefilledCake}
                onSubmit={form.handleSubmit}
              />
            )}
          </AnimatePresence>
        </div>

        <RequestSidebar />
      </div>

      <OrderTrackingView requests={form.activeRequests} dbConnected={form.dbConnected} onDelete={form.deleteRequest} />
    </div>
  );
}