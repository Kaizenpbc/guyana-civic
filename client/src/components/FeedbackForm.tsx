import React, { useState } from 'react';

const FeedbackForm = () => {
  const [message, setMessage] = useState('');
  const [rating, setRating] = useState<number | null>(null);

  const handleSubmit = () => {
    // Replace with actual submission logic
    console.log({ message, rating });
    alert('Thank you for your feedback!');
    setMessage('');
    setRating(null);
  };

  return (
    <div className="bg-white p-6 rounded shadow-md">
      <h3 className="text-lg font-bold mb-4">Submit Feedback</h3>
      <textarea
        className="w-full border rounded p-2 mb-4"
        rows={4}
        placeholder="Share your thoughts or suggestions..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <div className="mb-4">
        <label className="block mb-2 font-semibold">Rate your experience:</label>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <button
              key={num}
              className={`px-3 py-1 rounded ${rating === num ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
              onClick={() => setRating(num)}
            >
              {num}
            </button>
          ))}
        </div>
      </div>
      <button
        className="bg-blue-600 text-white px-4 py-2 rounded"
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
};

export default FeedbackForm;
