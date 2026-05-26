import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowLeft, UserPlus, User } from 'lucide-react';
import BottomNav from './shared/BottomNav';
import { peopleService } from '../services/peopleService';
import type { Person } from '../types';

export default function ChooseFamilyAccount() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadPeople() {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const familyPeople = await peopleService.list();

        if (!isMounted) return;

        setPeople(familyPeople);
      } catch (error) {
        if (!isMounted) return;

        setPeople([]);
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load people.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadPeople();

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredPeople = people.filter((person) =>
    person.officialDisplayName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectPerson = (personId: string, personName: string) => {
    navigate('/family-add-products', {
      state: { personId, personName }
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate('/choose-sale-type')}
            className="text-gray-600 active:text-gray-900"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-semibold text-gray-900">Who took it?</h1>
        </div>
        <p className="text-sm text-gray-600 pl-9">
          Select the person this feed should be tracked under.
        </p>
      </div>

      <div className="flex-1 p-4">
        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search people..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900"
            />
          </div>
        </div>

        {/* Add Person Button */}
        <button
          onClick={() => navigate('/add-account-person')}
          className="w-full bg-white border-2 border-dashed border-gray-300 p-4 rounded-lg mb-6 flex items-center justify-center gap-2 text-gray-600 active:bg-gray-50"
        >
          <UserPlus size={20} />
          <span className="font-medium">Add Person</span>
        </button>

        {/* People List */}
        <div className="mb-6">
          <h2 className="text-sm font-medium text-gray-700 mb-3">Recent People</h2>
          <div className="space-y-2">
            {isLoading && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
                Loading people...
              </div>
            )}

            {!isLoading && errorMessage && (
              <div className="bg-white border border-gray-300 rounded-lg p-4 text-sm text-gray-900">
                {errorMessage}
              </div>
            )}

            {!isLoading && !errorMessage && filteredPeople.length === 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 text-sm text-gray-700">
                No people found.
              </div>
            )}

            {!isLoading && !errorMessage && filteredPeople.map((person) => (
              <button
                key={person.id}
                onClick={() => handleSelectPerson(person.id, person.officialDisplayName)}
                className="w-full bg-white border border-gray-200 p-4 rounded-lg flex items-center gap-3 active:bg-gray-50"
              >
                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                  <User size={20} className="text-gray-600" />
                </div>
                <span className="font-medium text-gray-900">{person.officialDisplayName}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Skip Option */}
        <button
          onClick={() => handleSelectPerson('unassigned', 'Unassigned')}
          className="w-full text-gray-600 py-3 text-center active:text-gray-900"
        >
          Skip for now / Unassigned
        </button>
      </div>

      {/* Workflow Annotation */}
      <div className="p-4">
        <div className="p-3 bg-gray-50 border border-gray-300 rounded text-xs text-gray-600 leading-relaxed">
          <strong>Person Records:</strong><br />
          Family use must link to one controlled person record when possible. Search may support aliases, but records should use one official display name to avoid duplicates.
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
