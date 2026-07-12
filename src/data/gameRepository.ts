import { supabase } from '../lib/supabase';
import type { Game, NewGame, NewStation, Station, Task } from '../types/game';

interface GameRow {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
}

interface StationRow {
  id: string;
  game_id: string;
  name: string;
  latitude: number;
  longitude: number;
  radius_meters: number;
  points: number;
  order_index: number;
  task_type: string;
  task: Task;
}

function gameFromRow(row: GameRow): Game {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    createdAt: row.created_at,
  };
}

function stationFromRow(row: StationRow): Station {
  return {
    id: row.id,
    gameId: row.game_id,
    name: row.name,
    latitude: row.latitude,
    longitude: row.longitude,
    radiusMeters: row.radius_meters,
    points: row.points,
    order: row.order_index,
    task: row.task,
  };
}

export async function listGames(): Promise<Game[]> {
  const { data, error } = await supabase
    .from('games')
    .select('id, name, description, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as GameRow[]).map(gameFromRow);
}

export async function getGame(gameId: string): Promise<Game> {
  const { data, error } = await supabase
    .from('games')
    .select('id, name, description, created_at')
    .eq('id', gameId)
    .single();
  if (error) throw error;
  return gameFromRow(data as GameRow);
}

export async function createGame(input: NewGame): Promise<Game> {
  const { data, error } = await supabase
    .from('games')
    .insert({ name: input.name, description: input.description ?? null })
    .select('id, name, description, created_at')
    .single();
  if (error) throw error;
  return gameFromRow(data as GameRow);
}

export async function deleteGame(gameId: string): Promise<void> {
  const { error } = await supabase.from('games').delete().eq('id', gameId);
  if (error) throw error;
}

export async function listStations(gameId: string): Promise<Station[]> {
  const { data, error } = await supabase
    .from('stations')
    .select('id, game_id, name, latitude, longitude, radius_meters, points, order_index, task_type, task')
    .eq('game_id', gameId)
    .order('order_index', { ascending: true });
  if (error) throw error;
  return (data as StationRow[]).map(stationFromRow);
}

export async function getStation(stationId: string): Promise<Station> {
  const { data, error } = await supabase
    .from('stations')
    .select('id, game_id, name, latitude, longitude, radius_meters, points, order_index, task_type, task')
    .eq('id', stationId)
    .single();
  if (error) throw error;
  return stationFromRow(data as StationRow);
}

export async function createStation(input: NewStation): Promise<Station> {
  const { data, error } = await supabase
    .from('stations')
    .insert({
      game_id: input.gameId,
      name: input.name,
      latitude: input.latitude,
      longitude: input.longitude,
      radius_meters: input.radiusMeters,
      points: input.points,
      order_index: input.order,
      task_type: input.task.type,
      task: input.task,
    })
    .select('id, game_id, name, latitude, longitude, radius_meters, points, order_index, task_type, task')
    .single();
  if (error) throw error;
  return stationFromRow(data as StationRow);
}

export async function updateStation(station: Station): Promise<Station> {
  const { data, error } = await supabase
    .from('stations')
    .update({
      name: station.name,
      latitude: station.latitude,
      longitude: station.longitude,
      radius_meters: station.radiusMeters,
      points: station.points,
      order_index: station.order,
      task_type: station.task.type,
      task: station.task,
    })
    .eq('id', station.id)
    .select('id, game_id, name, latitude, longitude, radius_meters, points, order_index, task_type, task')
    .single();
  if (error) throw error;
  return stationFromRow(data as StationRow);
}

export async function deleteStation(stationId: string): Promise<void> {
  const { error } = await supabase.from('stations').delete().eq('id', stationId);
  if (error) throw error;
}
