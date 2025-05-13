import { Button } from 'antd';

interface RecentlyPlayed {
  id: string;
  artist: string;
  fans: string;
  albumsOrTracks: string;
  imageUrl: string;
}

const recentlyPlayed: RecentlyPlayed[] = [
  {
    id: '1',
    artist: 'Panjabi MC',
    fans: '10,241 fans',
    albumsOrTracks: '2 albums',
    imageUrl:
      'https://e-cdns-images.dzcdn.net/images/cover/614af5cb69dd52e4de82dd2cd9e217c9/500x500-000000-80-0-0.jpg',
  },
  {
    id: '2',
    artist: 'Chill House',
    fans: 'A selection of house...',
    albumsOrTracks: '100 tracks 11-09-2015',
    imageUrl:
      'https://e-cdns-images.dzcdn.net/images/cover/88a8288e14f61ffa39c14ac2ef9210d8/500x500-000000-80-0-0.jpg',
  },
  {
    id: '3',
    artist: 'Happy Hits',
    fans: 'Feel-good hits to gi...',
    albumsOrTracks: '80 tracks 02-12-2015',
    imageUrl:
      'https://e-cdns-images.dzcdn.net/images/cover/88a8288e14f61ffa39c14ac2ef9210d8/500x500-000000-80-0-0.jpg',
  },
  {
    id: '4',
    artist: 'MIXTAPE PLUTO',
    fans: 'Future',
    albumsOrTracks: '17 tracks 20-09-2024',
    imageUrl:
      'https://e-cdns-images.dzcdn.net/images/cover/88a8288e14f61ffa39c14ac2ef9210d8/500x500-000000-80-0-0.jpg',
  },
  {
    id: '5',
    artist: 'Manowar',
    fans: '245,279 fans',
    albumsOrTracks: '11 albums',
    imageUrl:
      'https://e-cdns-images.dzcdn.net/images/cover/614af5cb69dd52e4de82dd2cd9e217c9/500x500-000000-80-0-0.jpg',
  },
  {
    id: '6',
    artist: "Jane's Addiction",
    fans: '77,767 fans',
    albumsOrTracks: '18 albums',
    imageUrl:
      'https://e-cdns-images.dzcdn.net/images/artist/7eb4a5f4e331e0463f5a1890e79f8fe0/500x500-000000-80-0-0.jpg',
  },
];

function RecentlyPlayedCard({ item }: { item: RecentlyPlayed }) {
  return (
    <div className="bg-card p-4 rounded-lg">
      <div className="flex items-center space-x-4">
        <img
          src={item.imageUrl}
          alt={item.artist}
          className="w-16 h-16 rounded-full"
          width="60"
          height="60"
          style={{ aspectRatio: '60/60', objectFit: 'cover' }}
        />
        <div>
          <h3 className="font-bold">{item.artist}</h3>
          <p className="text-sm text-muted-foreground">{item.fans}</p>
          <p className="text-sm text-muted-foreground">{item.albumsOrTracks}</p>
        </div>
      </div>
    </div>
  );
}

export default function RecentlyPlayedSection() {
  return (
    <div className="bg-white text-card-foreground p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold">Recently Played</h2>
      <p className="text-muted-foreground mb-4">Rediscover the Soundtrack of Your Moments.</p>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-3">
        {recentlyPlayed.map((item) => (
          <RecentlyPlayedCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
