import {GetStaticProps} from 'next';
import Image from 'next/image';
import Link from 'next/link';
import {format, parseISO} from 'date-fns';
import ptBr from 'date-fns/locale/pt-BR';
import api from '../services/api';
import convertDurationTime from '../utils/convertDurationTime'
import styles from './home.module.scss';
import { useContext } from 'react';
import { PlayerContext } from '../contexts/PlayerContext';

type Episodes = {
  id: string;
  title: string;
  members:string;
  thumbnail: string;
  duration: number;
  durationAsString: string;
  url:string;
  publishedAt:string;
}
type HomeProps = {
  latestEpisode : Array<Episodes>;
  allEpisodes : Array<Episodes>;
}

export default function Home({latestEpisode, allEpisodes}:HomeProps) {
  const {playList} = useContext(PlayerContext);
  const episodeList = [...latestEpisode, ...allEpisodes];
  return (
    
    <div className={styles.homepage}>
    <section className={styles.latestEpisodes}>
      <h2>últimos lançamentos</h2>

      <ul>
        {latestEpisode.map((episode, index) => {
          return (
            <li key={episode.id}>
              <Image 
              width={192} 
              height={192} 
              src={episode.thumbnail} 
              alt={episode.title}
              objectFit="cover"/> 

              <div className={styles.episodeDetails}>
                <Link href={`/episodes/${episode.id}`}>
                <a> {episode.title} </a>
                </Link>
                <p>{episode.members}</p>
                <span> {episode.publishedAt}</span>
                <span> {episode.durationAsString}</span>
              </div>

              <button type="button" onClick={() => playList(episodeList,index)}>
                <img src="/play-green.svg" alt="Tocar episódio"/>
              </button>
            </li>
          )
        })}
      </ul>

    </section>
    <section className={styles.allEpisodes}>
      <h2>Todos episódios</h2>
      <table>
        <thead> 
          <tr>
          <th></th>
          <th>Podcast</th>
          <th>Integrantes</th>
          <th>Data</th>
          <th>Duração</th>
          <th></th>
          </tr>
        </thead>
        <tbody>
          {allEpisodes.map((episode,index)=> {
            return(
              <tr key={episode.id}> 
              <td style={{width:72}}> 
                <Image 
                width={120}
                height={120}
                src={episode.thumbnail}
                alt={episode.title}
                objectFit="cover"
                />
              </td>
              <td>
                <Link href={`/episodes/${episode.id}`}>
                  <a href="">{episode.title}</a>
                </Link>
              </td>
              <td>
                {episode.members}
              </td>
              <td style={{width:100}}>
                {episode.publishedAt}
              </td><td>
                {episode.durationAsString}
              </td>
              <td>
              <button type="button"
              onClick={() => playList(episodeList, index + latestEpisode.length)}
              ><img  src="/play-green.svg" alt="Tocar episódio"/></button>
              </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    
    </section>
    </div>
  )
}

export const getStaticProps:GetStaticProps = async () =>{
  const {data} = await api.get('episodes',  {
    params: {
      _limit : 12,
      _sort :'published_at',
      _order : 'desc',
    }
  });
   const paths = data.map( episode => {
     return {
     params : {
       slug: episode.id,
     }
    }

   }
   )

   

  const episodes = data.map(episode =>{
    return {
      id: episode.id,
      title: episode.title,
      thumbnail: episode.thumbnail,
      members: episode.members,
      publishedAt: format(parseISO(episode.published_at),'d MMM yy', {locale: ptBr}),
      duration: Number(episode.file.duration),
      durationAsString: convertDurationTime(Number(episode.file.duration)),
      url: episode.file.url,
    }
  })
  const latestEpisode = episodes.splice(0,2);
  const allEpisodes = episodes.splice(2, episodes.length);

  return { 
    props: {
      latestEpisode,
      allEpisodes,
    },
    revalidate:60*60*8,
  }

}
