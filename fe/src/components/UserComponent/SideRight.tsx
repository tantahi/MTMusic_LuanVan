'use client'

import React, { useState, useEffect } from 'react'
import { PlayCircle, PauseCircle, Heart, DollarSign } from 'lucide-react'
import axios from 'axios'
import { useAtomValue } from 'jotai'
import { userAtom, tokenAtom } from '@/lib/atom/user.atom'
import { usePlayerStore } from '@/hooks/usePlayer'
import { message, Modal, Button } from 'antd'
import Link from 'next/link'
import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { PaymentModal } from '@/components/UserComponent/PaymentModal'
import PurchaseModal from '@/components/UserComponent/PurchaseModal'

const stripePromise = loadStripe(
  'pk_test_51Ptwd9RuwfSTMxXEDOg4yP9eGWjHnxiOMVxnkUgTHVe8XHuY5yuVa13zSlX6sR1PGNqnHidjAGFzS4HiSIkDrDXB00gbiW5VjL'
)

interface Track {
  id: number
  title: string
  artist: string
  creator?: string
  cover: string
  audio: string
  duration?: string
  createdBy: number
  isLike: boolean
  isBuy: boolean
  price: number
  name?: string
  artist_name?: string
  img_url?: string
  audio_url?: string
}

interface UserType {
  id: number
  role: 'Admin' | 'Staff' | 'User' | 'Vip User'
}

export default function SidebarRight() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false)
  const [selectedTrack, setSelectedTrack] = useState<Track | null>(null)
  const [isModalVisible, setIsModalVisible] = useState(false)
  const token = useAtomValue(tokenAtom)
  const user = useAtomValue(userAtom) as UserType
  const { currentTrack, isPlaying, playTrack, togglePlay, updatePlaylist } = usePlayerStore()

  useEffect(() => {
    const fetchTopSongs = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/media/top-songs?userId=${user?.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setTracks(Array.isArray(response.data.data) ? response.data.data : [])
      } catch (error) {
        console.error('Failed to fetch top songs:', error)
        message.error('Failed to load top songs')
        setTracks([])
      }
    }

    if (user?.id && token) {
      fetchTopSongs()
    }
  }, [token, user])

  const handlePlayTrack = (e: React.MouseEvent, track: Track, index: number) => {
    e.preventDefault()
    e.stopPropagation()
  
    if (track.price > 0 && !track.isBuy && user?.role !== 'Vip User') {
      setSelectedTrack(track)
      setIsUpgradeModalOpen(true)
    } else {
      if (currentTrack && currentTrack.id === track.id) {
        togglePlay()
      } else {
        updatePlaylist(tracks.map(t => ({
          ...t,
          audio: `http://localhost:3001${t.audio || t.audio_url}`,
          cover: `http://localhost:3001${t.cover || t.img_url}`,
          title: t.title || t.name,
          artist: t.artist || t.artist_name
        })))
        playTrack(index)
      }
    }
  }

  const handleToggleFavorite = async (e: React.MouseEvent, track: Track) => {
    e.preventDefault()
    e.stopPropagation()
    try {
      if (track.isLike) {
        await axios.delete(`http://localhost:3001/media/favourite/${track.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setTracks(tracks.map(t => t.id === track.id ? { ...t, isLike: false } : t))
        message.success(`Removed "${track.title}" from favorites`)
      } else {
        await axios.post(`http://localhost:3001/media/favourite/${track.id}`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setTracks(tracks.map(t => t.id === track.id ? { ...t, isLike: true } : t))
        message.success(`Added "${track.title}" to favorites`)
      }
    } catch (error) {
      console.error('Failed to toggle favorite status:', error)
      message.error('Failed to update favorite status')
    }
  }

  const showModalVip = () => {
    setIsModalVisible(true)
  }

  const handleCancelVip = () => {
    setIsModalVisible(false)
  }

  return (
    <div className="w-full h-full p-4 bg-switch">
      <div className="rounded bg-switch xl:rounded-none">
        <div className="top_picks_content">
          <div className="track_section">
            <div className="flex flex-col gap-3 mb-4">
              <div className="flex justify-between">
                <h2 className="font-semibold text-xl text-onNeutralBg">Top Picks</h2>
              </div>
            </div>
            <div>
              <div className="list_content">
                <ul className="flex flex-col w-full list-none">
                  {tracks.map((track, index) => (
                    <li key={track.id} className={`relative p-3 flex items-center text-base !text-onNeutralBg hover:bg-card-hover hover:rounded cursor-pointer group border-divider focus-within:bg-divider focus-within:rounded py-3 ${index !== 0 ? 'border-t border-onNeutralBgDivider' : ''}`}>
                      <div className="relative flex justify-center w-full items-between group">
                        <div className="flex items-center justify-start flex-1 gap-2 xs:gap-4">
                          <div className="relative w-12 h-12">
                            <div className={`absolute w-full h-full group-hover:bg-main group-hover:opacity-70 ${currentTrack?.id === track.id && isPlaying ? 'bg-main opacity-70' : 'bg-transparent'}`}></div>
                            <img src={`http://localhost:3001${track.cover || track.img_url}`} alt={track.title || track.name} className="h-full w-full rounded aspect-square" />
                            <div className="absolute top-0 flex items-center justify-center w-full h-full">
                              <button
                                type="button"
                                onClick={(e) => handlePlayTrack(e, track, index)}
                                className={`h-7 w-7 rounded-full flex items-center justify-center disabled:cursor-not-allowed disabled:opacity-50 duration-300 ease-linear outline-none hover:scale-[1.1] transition-all bg-primary text-white ${currentTrack?.id === track.id && isPlaying ? '' : 'group-hover:flex hidden'}`}
                              >
                                {currentTrack?.id === track.id && isPlaying ? (
                                  <PauseCircle className="text-onNeutralBg text-white" size={20} />
                                ) : (
                                  <PlayCircle className="text-onNeutralBg text-white" size={20} />
                                )}
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col flex-1 w-full gap-1 text-onNeutralBg">
                            <span className="text-xs">
                              {track.title || track.name}
                              {track.price > 0 && !track.isBuy && (
                                <span className="ml-1 inline-flex items-center rounded-full bg-primary px-1.5 py-0.5 text-[10px] font-medium text-white">
                                  {user?.role === 'Vip User' ? (
                                    'VIP'
                                  ) : (
                                    <>
                                      <DollarSign className="mr-0.5 h-2 w-2" />
                                      {(track.price / 100).toFixed(2)}
                                    </>
                                  )}
                                </span>
                              )}
                              {track.isBuy && (
                                <span className="ml-1 inline-flex items-center rounded-full bg-green-500 px-1.5 py-0.5 text-[10px] font-medium text-white">
                                  Purchased
                                </span>
                              )}
                            </span>
                            <div className="flex flex-col xs:flex-row">
                              <Link href={`/home/artist/${track.createdBy}`} onClick={(e) => e.stopPropagation()} className="text-secondary text-[12px] hover:underline underline-offset-4 cursor-pointer">
                                {track.artist || track.artist_name}
                              </Link>
                            </div>
                          </div>
                        </div>
                        {/* <div className="absolute right-0 flex items-center gap-2">
                          <button
                            type="button"
                            className={`p-2 transition-colors duration-200 ${
                              track.isLike
                                ? 'text-primary dark:text-dark-primary'
                                : 'text-onNeutralBgSecondary hover:text-primary dark:text-dark-onNeutralBgSecondary dark:hover:text-dark-primary'
                            }`}
                            title={track.isLike ? 'Unlike' : 'Like'}
                            onClick={(e) => handleToggleFavorite(e, track)}
                          >
                            <Heart className={`h-5 w-5 ${track.isLike ? 'fill-current' : ''}`} />
                          </button>
                        </div> */}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
        <div className="footer">
          <div className="py-4 border-t border-onNeutralBgDivider border-divider">
            <div className="footer_links">
              <div className="flex gap-2 mt-4">
                <a className="text-sm hover:text-primary" href="/">About</a>
                <a className="text-sm hover:text-primary" href="/">Contact</a>
                <a className="text-sm hover:text-primary" href="/">Legal</a>
                <a className="text-sm hover:text-primary" href="/">Policy</a>
              </div>
              <div className="mt-2 footer_copyright">
                <p className="text-xs text-secondary"> © Copyright 2023</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Purchase Options"
        open={isUpgradeModalOpen}
        onCancel={() => setIsUpgradeModalOpen(false)}
        footer={null}
      >
        <p>This song is only available for VIP users or through individual purchase. Please choose an option:</p>
        <div className="mt-4 flex justify-between">
          <Button onClick={() => {
            setIsUpgradeModalOpen(false)
            showModalVip()
          }}>
            Upgrade to VIP
          </Button>
          {selectedTrack && (
            <PurchaseModal
              price={selectedTrack.price / 100}
              itemId={selectedTrack.id.toString()}
              itemType="Song"
            />
          )}
        </div>
      </Modal>

      <Elements stripe={stripePromise} key="upgrade">
        <PaymentModal visible={isModalVisible} onCancel={handleCancelVip} />
      </Elements>
    </div>
  )
}

