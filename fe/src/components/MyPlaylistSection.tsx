import React, { useState } from 'react';
import { PlusIcon, CloudUploadIcon, XIcon } from 'lucide-react';

interface Playlist {
  id: number;
  title: string;
  description: string;
  tracks: number;
  date: string;
  imageUrl: string;
}

const initialPlaylists: Playlist[] = [
  {
    id: 1,
    title: 'My Playlist #17',
    description: 'Here is an optional ...',
    tracks: 1,
    date: '16-08-2024',
    imageUrl:
      'https://e-cdns-images.dzcdn.net/images/cover/b0e936124f59e669ddba02ebe5893f95/250x250-000000-80-0-0.jpg',
  },
  {
    id: 2,
    title: 'New test',
    description: 'Here is an optional ...',
    tracks: 2,
    date: '15-08-2024',
    imageUrl:
      'https://e-cdns-images.dzcdn.net/images/cover/b69d3bcbd130ad4cc9259de543889e30/250x250-000000-80-0-0.jpg',
  },
];

const PlaylistManager: React.FC = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>(initialPlaylists);
  const [showForm, setShowForm] = useState(false);
  const [editingPlaylist, setEditingPlaylist] = useState<Playlist | null>(null);

  const handleShowForm = (playlist?: Playlist) => {
    setEditingPlaylist(playlist || null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingPlaylist(null);
  };

  const handleSavePlaylist = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('desc') as string;

    if (editingPlaylist) {
      setPlaylists(
        playlists.map((p) =>
          p.id === editingPlaylist.id ? { ...p, title, description } : p
        )
      );
    } else {
      const newPlaylist: Playlist = {
        id: Date.now(),
        title,
        description,
        tracks: 0,
        date: new Date().toLocaleDateString('en-GB'),
        imageUrl: '/placeholder.svg',
      };
      setPlaylists([...playlists, newPlaylist]);
    }
    handleCloseForm();
  };

  return (
    <section className="my_playlist_page">
      <section className="media_section">
        <div className="media_content">
          <div className="relative">
            <div className="mb-4 flex flex-col gap-3">
              <div className="flex_justify_between">
                <h2 className="text-2xl font-semibold text-onNeutralBg">
                  My Playlists
                </h2>
              </div>
              <p className="-mt-2 text-sm font-normal tracking-wider text-secondary">
                Curate your sounds and tracks at the go.
              </p>
              <div className="bg-divider h-[1px] w-full"></div>
            </div>
            <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {playlists.map((playlist) => (
                <li key={playlist.id} className="col-span-1">
                  <div
                    className="bg-card border-divider hover:bg-card-hover group relative cursor-pointer px-3 py-3 transition-all duration-300 hover:rounded"
                    onClick={() => handleShowForm(playlist)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative h-28 w-28">
                        <div className="group-hover:bg-main absolute h-full w-full rounded bg-transparent group-hover:opacity-70"></div>
                        <img
                          src={playlist.imageUrl}
                          className="shadow_card aspect-square h-full w-full rounded object-cover"
                          alt={playlist.title}
                        />
                      </div>
                      <div className="flex w-full flex-1 items-start justify-between">
                        <div className="flex flex-col">
                          <h6 className="text-sm text-onNeutralBg">
                            {playlist.title}
                          </h6>
                          <p className="text-sm font-normal text-secondary">
                            {playlist.description}
                          </p>
                          <p className="mt-1 text-xs font-normal text-secondary">
                            <span>
                              {playlist.tracks} track
                              {playlist.tracks !== 1 ? 's' : ''}
                            </span>
                            <span>&nbsp;&nbsp;{playlist.date}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
              <li className="col-span-1">
                <div className="add_playlist h-full">
                  <div
                    className="flex_justify_center h-full w-full flex-col gap-2 rounded border border-dashed border-secondary p-4 text-onNeutralBg"
                    onClick={() => handleShowForm()}
                  >
                    <button
                      type="button"
                      className="flex_justify_center flex h-12 w-12 items-center justify-center rounded-full bg-primary shadow-lg outline-none transition-all duration-300 ease-linear hover:scale-[1.1] disabled:cursor-not-allowed disabled:opacity-50"
                      aria-label="Add new playlist"
                    >
                      <PlusIcon className="text-white" size={30} />
                    </button>
                    <p className="text-sm font-semibold tracking-wider">
                      Add new playlist
                    </p>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-main shadow-dialog relative mb-[60px] mt-[60px] h-full max-h-[80vh] w-full max-w-md overflow-y-auto rounded p-6">
            <div>
              <div className="mb-4 flex flex-col gap-3">
                <div className="flex_justify_between">
                  <h2 className="text-xl font-semibold text-onNeutralBg">
                    {editingPlaylist ? 'Edit Details' : 'Create Playlist'}
                  </h2>
                </div>
                <div className="bg-divider h-[1px] w-full"></div>
              </div>
              <form
                className="flex flex-col gap-5"
                onSubmit={handleSavePlaylist}
              >
                <fieldset className="flex flex-col">
                  <label
                    className="mb-2 text-sm font-semibold text-secondary"
                    htmlFor="image"
                  >
                    Cover Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    id="image"
                  />
                  <div className="bg-main relative flex h-40 w-40 flex-col gap-2 rounded p-2">
                    <div className="border-gray-600 flex h-full w-full cursor-pointer items-center justify-center rounded border-2 border-dashed">
                      <div className="flex flex-col items-center gap-2">
                        <CloudUploadIcon
                          className="!text-secondary text-onNeutralBg"
                          size={25}
                        />
                        <div className="text-center text-sm font-semibold text-secondary">
                          Browse file to upload
                        </div>
                      </div>
                    </div>
                  </div>
                </fieldset>
                <fieldset>
                  <div className="flex items-baseline justify-between">
                    <label
                      className="mb-2 text-xs font-semibold text-secondary"
                      htmlFor="title"
                    >
                      Title
                    </label>
                  </div>
                  <div className="border-divider relative rounded border px-2 py-1 focus-within:border-primary">
                    <div className="flex items-center justify-between">
                      <input
                        name="title"
                        className="no-focus border-divider h-10 w-full bg-transparent text-sm text-onNeutralBg outline-0 disabled:text-secondary"
                        type="text"
                        placeholder="Title"
                        defaultValue={editingPlaylist?.title}
                      />
                    </div>
                  </div>
                </fieldset>
                <fieldset>
                  <div className="flex items-baseline justify-between">
                    <label
                      className="mb-2 text-xs font-semibold text-secondary"
                      htmlFor="desc"
                    >
                      Description
                    </label>
                  </div>
                  <div className="border-divider relative rounded border px-2 py-1 focus-within:border-primary">
                    <textarea
                      name="desc"
                      placeholder=""
                      rows={5}
                      className="no-focus w-full bg-transparent text-sm text-onNeutralBg outline-0"
                      defaultValue={editingPlaylist?.description}
                    ></textarea>
                  </div>
                </fieldset>
                <div className="flex w-full items-center justify-start">
                  <button
                    className="scale-1 w-fit rounded bg-primary px-4 py-2 text-sm font-semibold text-white outline-none transition duration-300 ease-linear disabled:cursor-not-allowed disabled:opacity-50"
                    type="submit"
                  >
                    <div className="flex flex-row items-center">
                      <div className="w-full whitespace-nowrap text-center">
                        Save
                      </div>
                    </div>
                  </button>
                </div>
              </form>
            </div>
            <button
              className="flex_justify_center shadow-dialog absolute right-[10px] top-[10px] h-6 w-6 items-center justify-center rounded-full bg-primary outline-0"
              aria-label="Close"
              type="button"
              onClick={handleCloseForm}
            >
              <XIcon className="text-onNeutralBg" size={15} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
};

export default PlaylistManager;
