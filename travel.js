document.getElementById('plannerForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const loading = document.getElementById('loading');
    const resultContainer = document.getElementById('resultContainer');
    const timeline = document.getElementById('itineraryTimeline');

    submitBtn.disabled = true;
    loading.classList.remove('hidden');
    resultContainer.classList.add('hidden');
    timeline.innerHTML = '';

    const destination = document.getElementById('destination').value;
    const durationInput = document.getElementById('duration').value;

    const payload = {
        destination: destination,
        duration: parseInt(durationInput, 10), // Ensure this is passed as a real integer
        budget: document.getElementById('budget').value,
        vibe: document.getElementById('vibe').value
    };

    try {
        const response = await fetch('/api/plan-trip', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (response.ok) {
            document.getElementById('tripTitle').innerText = data.trip_title || "Your Custom Itinerary";

            if (!data.itinerary || !Array.isArray(data.itinerary)) {
                throw new Error("Invalid itinerary structure received from server.");
            }

            data.itinerary.forEach(day => {
                const daySection = document.createElement('div');
                daySection.className = 'bg-white rounded-xl shadow p-6 border-l-4 border-indigo-500';
                
                let dayHeader = `
                    <h3 class="text-xl font-bold text-indigo-700 mb-1">Day ${day.day}: ${day.theme || ''}</h3>
                    <div class="mt-4 border-l border-gray-200 ml-3 pl-6 space-y-6">
                `;

                let activitiesHtml = '';
                if (day.activities && Array.isArray(day.activities)) {
                    day.activities.forEach(act => {
                        // Standardized clean Google Maps search link format
                        const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(act.place_name + ' ' + destination)}`;
                        
                        activitiesHtml += `
                            <div class="relative">
                                <span class="timeline-dot"></span>
                                <div class="text-xs font-semibold text-indigo-600 uppercase tracking-wider">${act.time || ''}</div>
                                <h4 class="font-bold text-gray-900 mt-0.5">${act.place_name || 'Destination'}</h4>
                                <p class="text-sm text-gray-600 mt-1">${act.description || ''}</p>
                                <div class="mt-2 flex items-center justify-between text-xs text-gray-400">
                                    <span>Estimated Cost: <strong class="text-gray-600">${act.estimated_cost || 'N/A'}</strong></span>
                                    <a href="${mapsUrl}" target="_blank" class="text-indigo-500 hover:underline font-medium">View on Maps ↗</a>
                                </div>
                            </div>
                        `;
                    });
                }

                daySection.innerHTML = dayHeader + activitiesHtml + '</div>';
                timeline.appendChild(daySection);
            });

            resultContainer.classList.remove('hidden');
        } else {
            alert('Server Error: ' + (data.error || 'Unknown error occurred.'));
        }
    } catch (err) {
        console.error('Execution Breakdown:', err);
        alert('App Error: ' + err.message);
    } finally {
        submitBtn.disabled = false;
        loading.classList.add('hidden');
    }
});