import { useCallback, useMemo, useState, type Dispatch, type SetStateAction } from 'react';
import { Player, ClassProfile } from '../../../types';
import { COMPUTER_NAMES, PRELOADED_CLASSES } from '../../../constants';

interface UseSetupProfilesOptions {
  initialPlayers?: Player[];
}

interface UseSetupProfilesResult {
  players: Partial<Player>[];
  setPlayers: Dispatch<SetStateAction<Partial<Player>[]>>;
  isSolo: boolean;
  setIsSolo: Dispatch<SetStateAction<boolean>>;
  classProfiles: ClassProfile[];
  selectedProfileId: string;
  setSelectedProfileId: Dispatch<SetStateAction<string>>;
  newProfileName: string;
  setNewProfileName: Dispatch<SetStateAction<string>>;
  handleSoloToggle: (checked: boolean) => void;
  addPlayer: () => void;
  removePlayer: (index: number) => void;
  updatePlayer: (index: number, field: keyof Player, value: any) => void;
  loadClassProfile: (profileName: string) => void;
  saveClassProfile: () => void;
}

const MAX_PLAYERS = 5;

const readLocalStorageBoolean = (key: string, fallback = false) => {
  try {
    return window.localStorage.getItem(key) === 'true' || fallback;
  } catch {
    return fallback;
  }
};

const readLocalStorageString = (key: string, fallback = '') => {
  try {
    return window.localStorage.getItem(key) ?? fallback;
  } catch {
    return fallback;
  }
};

export const useSetupProfiles = (
  options: UseSetupProfilesOptions
): UseSetupProfilesResult => {
  const { initialPlayers } = options;

  const initialPlayerState = useMemo<Partial<Player>[]>(() => {
    if (initialPlayers && initialPlayers.length > 0) {
      return initialPlayers.map((player) => ({
        name: player.name,
        isComputer: player.isComputer,
        difficulty: player.difficulty,
      }));
    }

    const savedSolo = readLocalStorageBoolean('fs_last_issolo');
    const p1Name = readLocalStorageString('fs_player1_name', 'Player 1');

    if (savedSolo) {
      const compName = COMPUTER_NAMES[Math.floor(Math.random() * COMPUTER_NAMES.length)];
      return [
        { name: p1Name, isComputer: false, difficulty: 1 },
        { name: compName, isComputer: true, difficulty: 2 },
      ];
    }

    return [
      { name: p1Name, isComputer: false, difficulty: 1 },
      { name: 'Player 2', isComputer: false, difficulty: 1 },
    ];
  }, [initialPlayers]);

  const [players, setPlayers] = useState<Partial<Player>[]>(initialPlayerState);

  const [isSolo, setIsSolo] = useState<boolean>(() => {
    if (initialPlayers && initialPlayers.length > 0) {
      return initialPlayers.length === 2 && Boolean(initialPlayers[1].isComputer);
    }
    return readLocalStorageBoolean('fs_last_issolo');
  });

  const [classProfiles, setClassProfiles] = useState<ClassProfile[]>(() => {
    try {
      const saved = window.localStorage.getItem('fs_class_profiles');
      return saved ? [...PRELOADED_CLASSES, ...JSON.parse(saved)] : PRELOADED_CLASSES;
    } catch {
      return PRELOADED_CLASSES;
    }
  });

  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [newProfileName, setNewProfileName] = useState('');

  const handleSoloToggle = useCallback(
    (checked: boolean) => {
      setIsSolo(checked);

      setPlayers((prev) => {
        const next = [...prev];

        if (checked) {
          const p1 = next[0] || { name: 'Player 1', isComputer: false, difficulty: 1 };
          const compName = COMPUTER_NAMES[Math.floor(Math.random() * COMPUTER_NAMES.length)];
          const p2 = { name: compName, isComputer: true, difficulty: 2 };
          return [{ ...p1, isComputer: false }, p2];
        }

        const p1 = next[0] || { name: 'Player 1', isComputer: false, difficulty: 1 };
        let p2 = next[1];

        if (!p2) {
          p2 = { name: 'Player 2', isComputer: false, difficulty: 1 };
        } else if (p2.isComputer) {
          p2 = { ...p2, name: 'Player 2', isComputer: false, difficulty: 1 };
        }

        if (next.length > 2) {
          return [p1, p2, ...next.slice(2)];
        }

        return [p1, p2];
      });
    },
    []
  );

  const addPlayer = useCallback(() => {
    setPlayers((prev) => {
      if (prev.length >= MAX_PLAYERS) return prev;
      return [
        ...prev,
        { name: `Player ${prev.length + 1}`, isComputer: false, difficulty: 1 },
      ];
    });
  }, []);

  const removePlayer = useCallback((index: number) => {
    setPlayers((prev) => {
      if (prev.length <= 1) return prev;
      return prev.filter((_, idx) => idx !== index);
    });
  }, []);

  const updatePlayer = useCallback((index: number, field: keyof Player, value: any) => {
    setPlayers((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };

      if (field === 'isComputer' && value === true) {
        updated[index].name = COMPUTER_NAMES[Math.floor(Math.random() * COMPUTER_NAMES.length)];
      } else if (field === 'isComputer' && value === false) {
        if (COMPUTER_NAMES.includes(updated[index].name || '')) {
          updated[index].name = `Player ${index + 1}`;
        }
      }

      return updated;
    });
  }, []);

  const loadClassProfile = useCallback(
    (profileName: string) => {
      const profile = classProfiles.find((p) => p.name === profileName);
      if (!profile) return;

      const newPlayers = profile.players.map((name) => ({
        name,
        isComputer: false,
        difficulty: 1,
      }));

      setPlayers(newPlayers);
      setSelectedProfileId(profileName);
      setIsSolo(false);
    },
    [classProfiles]
  );

  const saveClassProfile = useCallback(() => {
    const trimmed = newProfileName.trim();
    if (!trimmed) {
      window.alert('Please enter a name for this class profile.');
      return;
    }

    const newProfile: ClassProfile = {
      name: trimmed,
      players: players.map((p) => p.name || 'Player'),
    };

    const customProfiles = classProfiles.filter(
      (profile) => !PRELOADED_CLASSES.some((preset) => preset.name === profile.name)
    );

    const existingIdx = customProfiles.findIndex((profile) => profile.name === newProfile.name);
    let updatedCustom: ClassProfile[];

    if (existingIdx >= 0) {
      const shouldOverwrite = window.confirm(
        `Overwrite existing profile "${newProfile.name}"?`
      );
      if (!shouldOverwrite) return;
      updatedCustom = [...customProfiles];
      updatedCustom[existingIdx] = newProfile;
    } else {
      updatedCustom = [...customProfiles, newProfile];
    }

    const allProfiles = [...PRELOADED_CLASSES, ...updatedCustom];
    setClassProfiles(allProfiles);
    setSelectedProfileId(newProfile.name);
    setNewProfileName('');

    try {
      window.localStorage.setItem('fs_class_profiles', JSON.stringify(updatedCustom));
    } catch {
      /* swallow storage errors */
    }
  }, [classProfiles, newProfileName, players]);

  return {
    players,
    setPlayers,
    isSolo,
    setIsSolo,
    classProfiles,
    selectedProfileId,
    setSelectedProfileId,
    newProfileName,
    setNewProfileName,
    handleSoloToggle,
    addPlayer,
    removePlayer,
    updatePlayer,
    loadClassProfile,
    saveClassProfile,
  };
};

